package br.com.beneficiosweg.mobile.location

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import org.json.JSONObject

class GeofenceReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val event = GeofencingEvent.fromIntent(intent) ?: return
        if (event.hasError()) {
            LocalDatabase(context).use { it.write("monitoring-error", event.errorCode.toString()) }; return
        }
        if (event.geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER) {
            try {
                ContextCompat.startForegroundService(context, Intent(context, VisitService::class.java))
            } catch (error: RuntimeException) {
                LocalDatabase(context).use { it.write("monitoring-error", error.javaClass.simpleName) }
            }
        }
    }
}

class RestoreReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        val config = LocalDatabase(context).use { it.read("monitoring") } ?: return
        if (!GeofenceRegistry.permitted(context)) return
        val pending = goAsync()
        try {
            GeofenceRegistry.register(context, JSONObject(config)).addOnCompleteListener { task ->
                if (!task.isSuccessful) LocalDatabase(context).use { it.write("monitoring-error", "restore_failed") }
                pending.finish()
            }
        } catch (error: RuntimeException) { pending.finish() }
    }
}
