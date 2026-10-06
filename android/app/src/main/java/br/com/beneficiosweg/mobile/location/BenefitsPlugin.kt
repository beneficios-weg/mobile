package br.com.beneficiosweg.mobile.location

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

@CapacitorPlugin(name = "BenefitsNative", permissions = [
    Permission(alias = "location", strings = [Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION])
])
class BenefitsPlugin : Plugin() {
    @PluginMethod fun requestLocation(call: PluginCall) {
        if (getPermissionState("location") == PermissionState.GRANTED) call.resolve()
        else requestPermissionForAlias("location", call, "locationResult")
    }
    @PermissionCallback private fun locationResult(call: PluginCall) {
        if (getPermissionState("location") == PermissionState.GRANTED) call.resolve()
        else call.reject("Permissão de localização precisa não concedida")
    }
    @PluginMethod fun openSettings(call: PluginCall) {
        activity.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}")))
        call.resolve()
    }
    @PluginMethod fun status(call: PluginCall) {
        LocalDatabase(context).use { db -> call.resolve(JSObject().put("backgroundAllowed", GeofenceRegistry.permitted(context))
            .put("enabled", db.read("monitoring") != null).put("error", db.read("monitoring-error"))) }
    }
    @PluginMethod @Suppress("MissingPermission") fun position(call: PluginCall) {
        if (getPermissionState("location") != PermissionState.GRANTED) return call.reject("Permissão de localização necessária")
        val cancellation = CancellationTokenSource()
        val handler = android.os.Handler(android.os.Looper.getMainLooper())
        val timeout = Runnable { cancellation.cancel() }
        handler.postDelayed(timeout, 20_000)
        LocationServices.getFusedLocationProviderClient(context).getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cancellation.token)
            .addOnSuccessListener { location ->
                handler.removeCallbacks(timeout)
                if (location == null) call.reject("Posição indisponível")
                else call.resolve(JSObject().put("latitude", location.latitude).put("longitude", location.longitude))
            }.addOnFailureListener { error -> handler.removeCallbacks(timeout); call.reject("Posição indisponível", error) }
            .addOnCanceledListener { handler.removeCallbacks(timeout); call.reject("Tempo de localização esgotado") }
    }
    @PluginMethod fun startMonitoring(call: PluginCall) {
        val config = call.getObject("configuration") ?: return call.reject("Configuração necessária")
        if (!GeofenceRegistry.permitted(context)) return call.reject("Ative localização precisa e Permitir o tempo todo nas configurações")
        try {
            VisitRules(config.getLong("dwellMs"), config.getDouble("maxAccuracy"), config.getDouble("maxSpeed"), config.getLong("maxGapMs"), config.getInt("minimumSamples"))
            require(config.getLong("cooldownMs") >= 0)
            require(config.getString("owner")?.isNotBlank() == true)
            GeofenceRegistry.stop(context).addOnCompleteListener { removed ->
                if (!removed.isSuccessful) { call.reject("Falha ao substituir monitoramento"); return@addOnCompleteListener }
                try {
                    LocalDatabase(context).use { it.write("monitoring", config.toString()); it.delete("monitoring-error") }
                    GeofenceRegistry.register(context, config).addOnSuccessListener { call.resolve() }.addOnFailureListener { error ->
                        LocalDatabase(context).use { it.delete("monitoring") }; call.reject("Falha ao registrar geofences", error)
                    }
                } catch (error: Exception) {
                    LocalDatabase(context).use { it.delete("monitoring") }; call.reject("Configuração inválida", error)
                }
            }
        } catch (error: Exception) { call.reject("Configuração inválida", error) }
    }
    @PluginMethod fun stopMonitoring(call: PluginCall) {
        LocalDatabase(context).use { it.delete("monitoring") }
        context.stopService(Intent(context, VisitService::class.java))
        GeofenceRegistry.stop(context).addOnSuccessListener { call.resolve() }.addOnFailureListener { call.reject("Falha ao remover geofences", it) }
    }
    @PluginMethod fun pendingVisits(call: PluginCall) {
        LocalDatabase(context).use { call.resolve(JSObject().put("visits", JSArray(it.pending(call.getString("owner") ?: "").toString()))) }
    }
    @PluginMethod fun acknowledgeVisit(call: PluginCall) {
        LocalDatabase(context).use { it.acknowledge(call.getString("owner") ?: "", call.getString("id") ?: "") }; call.resolve()
    }
    @PluginMethod fun clearOwner(call: PluginCall) {
        LocalDatabase(context).use { it.clearOwner(call.getString("owner") ?: "") }; call.resolve()
    }
}
