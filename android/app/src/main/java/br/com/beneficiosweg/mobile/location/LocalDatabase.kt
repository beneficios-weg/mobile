package br.com.beneficiosweg.mobile.location

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

/** Shared by the WebView bridge and receivers; never stores raw GPS samples. */
class LocalDatabase(context: Context) : SQLiteOpenHelper(context, "benefits.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
        db.execSQL("CREATE TABLE visit_queue (id TEXT PRIMARY KEY, owner TEXT NOT NULL, payload TEXT NOT NULL)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) = Unit
    fun read(key: String): String? = readableDatabase.rawQuery("SELECT value FROM cache WHERE key=?", arrayOf(key)).use {
        if (it.moveToFirst()) it.getString(0) else null
    }
    fun write(key: String, value: String) {
        writableDatabase.execSQL("INSERT OR REPLACE INTO cache(key,value) VALUES (?,?)", arrayOf(key, value))
    }
    fun delete(key: String) { writableDatabase.delete("cache", "key=?", arrayOf(key)) }
    fun enqueue(owner: String, payload: JSONObject) {
        writableDatabase.execSQL("INSERT OR IGNORE INTO visit_queue(id,owner,payload) VALUES (?,?,?)",
            arrayOf(payload.getString("id"), owner, payload.toString()))
    }
    fun pending(owner: String): JSONArray {
        val result = JSONArray()
        readableDatabase.rawQuery("SELECT payload FROM visit_queue WHERE owner=? ORDER BY rowid", arrayOf(owner)).use {
            while (it.moveToNext()) result.put(JSONObject(it.getString(0)))
        }
        return result
    }
    fun acknowledge(owner: String, id: String) { writableDatabase.delete("visit_queue", "owner=? AND id=?", arrayOf(owner, id)) }
    fun clearOwner(owner: String) {
        writableDatabase.beginTransaction()
        try {
            writableDatabase.delete("visit_queue", "owner=?", arrayOf(owner))
            delete("user:$owner")
            delete("monitoring:$owner")
            writableDatabase.delete("cache", "key LIKE ?", arrayOf("cooldown:$owner:%"))
            writableDatabase.setTransactionSuccessful()
        } finally { writableDatabase.endTransaction() }
    }
}
