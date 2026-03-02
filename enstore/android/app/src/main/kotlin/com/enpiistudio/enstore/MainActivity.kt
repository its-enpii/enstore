package com.enpiistudio.enstore

import android.provider.ContactsContract
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    private val CHANNEL = "enstore_app/contacts"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                if (call.method == "getAllContacts") {
                    try {
                        val contacts = fetchAllContacts()
                        result.success(contacts)
                    } catch (e: Exception) {
                        result.error("ERROR", "Failed to fetch contacts: ${e.message}", null)
                    }
                } else {
                    result.notImplemented()
                }
            }
    }

    private fun fetchAllContacts(): List<Map<String, String>> {
        val uri = ContactsContract.CommonDataKinds.Phone.CONTENT_URI
        val projection = arrayOf(
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
            ContactsContract.CommonDataKinds.Phone.NUMBER,
            ContactsContract.CommonDataKinds.Phone.TYPE,
            ContactsContract.CommonDataKinds.Phone.LABEL,
            ContactsContract.RawContacts.ACCOUNT_NAME,
            ContactsContract.RawContacts.ACCOUNT_TYPE
        )

        val sortOrder = "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC"
        val cursor = contentResolver.query(uri, projection, null, null, sortOrder)

        // Map dengan kunci = nomor yang dinormalisasi, untuk deduplikasi
        val seen = LinkedHashMap<String, Map<String, String>>()

        cursor?.use { c ->
            val nameIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
            val numberIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
            val typeIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.TYPE)
            val labelIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.LABEL)
            val accountNameIdx = c.getColumnIndex(ContactsContract.RawContacts.ACCOUNT_NAME)

            while (c.moveToNext()) {
                val name = c.getString(nameIdx) ?: "(No Name)"
                val rawNumber = c.getString(numberIdx) ?: continue
                val type = c.getInt(typeIdx)
                val customLabel = c.getString(labelIdx) ?: ""
                val accountName = c.getString(accountNameIdx) ?: "Unknown"

                val label = when (type) {
                    ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE -> "Mobile"
                    ContactsContract.CommonDataKinds.Phone.TYPE_HOME -> "Home"
                    ContactsContract.CommonDataKinds.Phone.TYPE_WORK -> "Work"
                    ContactsContract.CommonDataKinds.Phone.TYPE_MAIN -> "Main"
                    ContactsContract.CommonDataKinds.Phone.TYPE_FAX_HOME -> "Home Fax"
                    ContactsContract.CommonDataKinds.Phone.TYPE_FAX_WORK -> "Work Fax"
                    ContactsContract.CommonDataKinds.Phone.TYPE_OTHER -> "Other"
                    ContactsContract.CommonDataKinds.Phone.TYPE_CUSTOM -> customLabel.ifEmpty { "Phone" }
                    else -> "Phone"
                }

                // Normalisasi nomor: hapus semua karakter non-digit, lalu standarkan prefix
                var normalized = rawNumber.replace(Regex("[^0-9]"), "")
                if (normalized.startsWith("62")) {
                    normalized = "0" + normalized.substring(2)
                } else if (normalized.startsWith("8")) {
                    normalized = "0$normalized"
                }

                // Kunci unik = nama (lowercase) + nomor ternormalisasi
                // Ini mencegah nomor yang sama dari akun berbeda muncul 2x
                val dedupeKey = "${name.lowercase().trim()}_$normalized"

                // Hanya masukkan jika belum ada, atau jika yang baru punya nama lebih baik
                if (!seen.containsKey(dedupeKey)) {
                    seen[dedupeKey] = mapOf(
                        "name" to name,
                        "number" to normalized,
                        "label" to label,
                        "account" to accountName
                    )
                }
            }
        }

        return seen.values.toList()
    }
}
