package com.mmi.members

import android.app.Application
import com.mmi.members.data.MmiRepository
import java.io.File

class MmiApplication : Application() {
    val repository: MmiRepository by lazy { MmiRepository(File(filesDir, "mmi_data.json")) }
}
