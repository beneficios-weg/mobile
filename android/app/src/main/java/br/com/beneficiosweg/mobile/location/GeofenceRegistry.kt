package br.com.beneficiosweg.mobile.location

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import org.json.JSONObject

object GeofenceRegistry {
    fun permitted(context: Context): Boolean =
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED &&
        (Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED)
    fun pending(context: Context): PendingIntent {
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0)
        return PendingIntent.getBroadcast(context, 10, Intent(context, GeofenceReceiver::class.java), flags)
    }
    @Suppress("MissingPermission")
    fun register(context: Context, configuration: JSONObject): Task<Void> {
        require(permitted(context)) { "Precise and background location permissions are required" }
        val regions = configuration.getJSONArray("regions")
        require(regions.length() in 1..100)
        val fences = (0 until regions.length()).map {
            val region = regions.getJSONObject(it)
            val lat = region.getDouble("latitude"); val lon = region.getDouble("longitude")
            val radius = region.getDouble("geofenceRadius")
            require(lat.isFinite() && lat in -90.0..90.0 && lon.isFinite() && lon in -180.0..180.0 && radius in 100.0..1000.0)
            require(region.getDouble("visitRadius") in 10.0..radius)
            Geofence.Builder().setRequestId(region.getString("id")).setCircularRegion(lat, lon, radius.toFloat())
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT).build()
        }
        val request = GeofencingRequest.Builder().setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER).addGeofences(fences).build()
        return LocationServices.getGeofencingClient(context).addGeofences(request, pending(context))
    }
    fun stop(context: Context): Task<Void> = LocationServices.getGeofencingClient(context).removeGeofences(pending(context))
}
