package com.mmi.members.data

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.Json
import java.io.File

/**
 * Local, file-backed store for all app data. Kept behind this class so it can later be
 * swapped for a shared backend without touching the UI.
 */
class MmiRepository(private val file: File) {

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val writeLock = Mutex()

    private val _data = MutableStateFlow(load())
    val data: StateFlow<AppData> = _data.asStateFlow()

    fun update(transform: (AppData) -> AppData) {
        _data.update(transform)
        // Always persist the latest snapshot so out-of-order launches can never write stale data.
        scope.launch { writeLock.withLock { write(_data.value) } }
    }

    private fun load(): AppData {
        val stored = if (file.exists()) {
            runCatching { json.decodeFromString(AppData.serializer(), file.readText()) }
                .onFailure { file.renameTo(File(file.parentFile, "${file.name}.corrupt")) }
                .getOrNull()
        } else {
            null
        }
        return stored?.withBuiltInMembers() ?: SeedData.initialData()
    }

    /** Makes sure every built-in member exists, e.g. after an app update adds one. */
    private fun AppData.withBuiltInMembers(): AppData {
        val missing = SeedData.members.filter { seed -> members.none { it.id == seed.id } }
        return if (missing.isEmpty()) this else copy(members = members + missing)
    }

    private fun write(data: AppData) {
        val tmp = File(file.parentFile, "${file.name}.tmp")
        tmp.writeText(json.encodeToString(AppData.serializer(), data))
        if (!tmp.renameTo(file)) {
            file.delete()
            tmp.renameTo(file)
        }
    }
}
