package br.com.beneficiosweg.mobile.location

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import org.json.JSONObject
import java.util.UUID

class VisitService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val client by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var configuration: JSONObject? = null
    private var previousLocation: Location? = null
    private val windows = mutableMapOf<String, VisitWindow>()
    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) { result.locations.forEach { evaluate(it) } }
    }
    override fun onBind(intent: Intent?): IBinder? = null
    @Suppress("MissingPermission")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (configuration != null) return START_NOT_STICKY
        val stored = LocalDatabase(this).use { it.read("monitoring") }
        if (stored == null || !GeofenceRegistry.permitted(this)) { stopSelf(); return START_NOT_STICKY }
        configuration = JSONObject(stored)
        val config = configuration!!
        val rules = rules(config)
        val manager = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= 26) manager.createNotificationChannel(NotificationChannel("visits", "Verificação de visitas", NotificationManager.IMPORTANCE_LOW))
        startForeground(101, NotificationCompat.Builder(this, "visits").setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentTitle("WEG Benefits").setContentText("Verificando proximidade por um período curto").setOngoing(true).build())
        val regions = config.getJSONArray("regions")
        for (i in 0 until regions.length()) windows[regions.getJSONObject(i).getString("id")] = VisitWindow(rules)
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000).setMinUpdateIntervalMillis(3000).build()
        client.requestLocationUpdates(request, callback, Looper.getMainLooper()).addOnFailureListener { stopSelf() }
        handler.postDelayed({ stopSelf() }, rules.dwellMs * 2 + 60_000)
        return START_NOT_STICKY
    }
    private fun rules(config: JSONObject) = VisitRules(config.getLong("dwellMs"), config.getDouble("maxAccuracy"),
        config.getDouble("maxSpeed"), config.getLong("maxGapMs"), config.getInt("minimumSamples"))
    private fun evaluate(location: Location) {
        val config = configuration ?: return
        if (!location.hasAccuracy() || SystemClock.elapsedRealtimeNanos() - location.elapsedRealtimeNanos > 15_000_000_000L ||
            (if (Build.VERSION.SDK_INT >= 31) location.isMock else location.isFromMockProvider)) {
            windows.values.forEach { it.reset() }; previousLocation = null; return
        }
        val previous = previousLocation
        val timeDifference = if (previous == null) 0.0 else (location.elapsedRealtimeNanos - previous.elapsedRealtimeNanos) / 1_000_000_000.0
        val speed = if (location.hasSpeed()) location.speed.toDouble()
            else if (previous != null && timeDifference > 0) previous.distanceTo(location) / timeDifference
            else Double.POSITIVE_INFINITY
        previousLocation = location
        val regions = config.getJSONArray("regions")
        val eligible = mutableListOf<Pair<JSONObject, Double>>()
        for (i in 0 until regions.length()) {
            val region = regions.getJSONObject(i)
            val distance = FloatArray(1)
            Location.distanceBetween(location.latitude, location.longitude, region.getDouble("latitude"), region.getDouble("longitude"), distance)
            if (distance[0] + location.accuracy <= region.getDouble("visitRadius")) eligible.add(region to distance[0].toDouble())
        }
        // Overlapping eligible regions are ambiguous: never guess which shop was visited.
        if (eligible.size != 1) { windows.values.forEach { it.reset() }; return }
        val (region, distance) = eligible.single()
        val id = region.getString("id")
        windows.filterKeys { it != id }.values.forEach { it.reset() }
        if (windows[id]?.sample(location.elapsedRealtimeNanos / 1_000_000, distance, region.getDouble("visitRadius"),
            location.accuracy.toDouble(), speed) != true) return
        LocalDatabase(this).use { db ->
            db.writableDatabase.beginTransaction()
            try {
            // Logout disables configuration before clearing the user's local data.
            if (db.read("monitoring") != config.toString()) return
            val cooldownKey = "cooldown:${config.getString("owner")}:$id"
            val previous = db.read(cooldownKey)?.toLongOrNull() ?: 0
            val now = System.currentTimeMillis()
            if (now - previous < config.getLong("cooldownMs")) { stopSelf(); return }
            val payload = JSONObject().put("id", UUID.randomUUID().toString()).put("establishmentId", id)
                .put("detectedAt", now).put("dwellMs", config.getLong("dwellMs"))
            db.enqueue(config.getString("owner"), payload)
            db.write(cooldownKey, now.toString())
            db.writableDatabase.setTransactionSuccessful()
            } finally { db.writableDatabase.endTransaction() }
        }
        stopSelf()
    }
    override fun onDestroy() {
        client.removeLocationUpdates(callback)
        handler.removeCallbacksAndMessages(null)
        windows.clear(); configuration = null; previousLocation = null
        super.onDestroy()
    }
}
