@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)

package com.mmi.members.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.mmi.members.data.AppData
import com.mmi.members.data.Member
import com.mmi.members.data.Report
import com.mmi.members.data.ReportType
import com.mmi.members.ui.MmiViewModel
import com.mmi.members.ui.Routes
import com.mmi.members.ui.components.DetailTopBar
import com.mmi.members.ui.components.EmptyState
import com.mmi.members.ui.components.MainTopBar
import com.mmi.members.ui.components.MemberAvatar
import com.mmi.members.ui.components.ReportCard
import com.mmi.members.ui.components.Tag
import com.mmi.members.ui.components.formatHours
import java.time.LocalDate
import java.time.format.DateTimeParseException

@Composable
fun ReportsScreen(
    data: AppData,
    me: Member,
    onOpenProfile: () -> Unit,
    onOpenReport: (String) -> Unit,
    onNewReport: () -> Unit,
) {
    // null = everyone
    var authorFilter by rememberSaveable { mutableStateOf<String?>(null) }
    val reports = data.reports
        .filter { authorFilter == null || it.authorId == authorFilter }
        .sortedByDescending { it.date }
    val totalHours = reports.sumOf { it.hours ?: 0.0 }

    Scaffold(
        topBar = { MainTopBar("Reports", me, onOpenProfile) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNewReport,
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("New report") },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = authorFilter == null, onClick = { authorFilter = null }, label = { Text("Everyone") })
                    data.members.forEach { member ->
                        FilterChip(
                            selected = authorFilter == member.id,
                            onClick = { authorFilter = member.id },
                            label = { Text(member.name) },
                        )
                    }
                }
                Text(
                    "${reports.size} reports · ${formatHours(totalHours)} hours logged",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (reports.isEmpty()) item { EmptyState("No reports yet. Tap New report to log field work, inspections or training.") }
            items(reports, key = { it.id }) { report ->
                ReportCard(report, data.members.find { it.id == report.authorId }, onClick = { onOpenReport(report.id) })
            }
        }
    }
}

@Composable
fun ReportDetailScreen(
    reportId: String,
    data: AppData,
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onDelete: (String) -> Unit,
) {
    val report = data.reports.find { it.id == reportId }
    val author = data.members.find { it.id == report?.authorId }
    var confirmDelete by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            DetailTopBar("Report", onBack) {
                if (report != null) {
                    IconButton(onClick = { onEdit(report.id) }) { Icon(Icons.Filled.Edit, contentDescription = "Edit") }
                    IconButton(onClick = { confirmDelete = true }) { Icon(Icons.Filled.Delete, contentDescription = "Delete") }
                }
            }
        },
    ) { padding ->
        if (report == null) {
            EmptyState("This report no longer exists.", Modifier.padding(padding).padding(16.dp))
            return@Scaffold
        }
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Tag(report.type.label)
                report.hours?.let { Tag("${formatHours(it)} h") }
            }
            Spacer(Modifier.height(8.dp))
            Text(report.title, style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (author != null) {
                    MemberAvatar(author, size = 28.dp)
                    Spacer(Modifier.width(8.dp))
                }
                Text(
                    listOfNotNull(author?.name, report.date).joinToString(" · "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            HorizontalDivider(Modifier.padding(vertical = 16.dp))
            Text(report.body.ifBlank { "No details." }, style = MaterialTheme.typography.bodyLarge)
        }
    }

    if (confirmDelete && report != null) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete report?") },
            text = { Text("\"${report.title}\" will be removed.") },
            confirmButton = {
                TextButton(onClick = { confirmDelete = false; onDelete(report.id) }) { Text("Delete") }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }
}

@Composable
fun ReportEditScreen(
    reportId: String,
    data: AppData,
    me: Member,
    onBack: () -> Unit,
    onSave: (Report) -> Unit,
) {
    val existing = data.reports.find { it.id == reportId }
    val isNew = reportId == Routes.NEW || existing == null

    var title by rememberSaveable { mutableStateOf(existing?.title.orEmpty()) }
    var type by rememberSaveable { mutableStateOf(existing?.type ?: ReportType.FIELD) }
    var date by rememberSaveable { mutableStateOf(existing?.date ?: LocalDate.now().toString()) }
    var hours by rememberSaveable { mutableStateOf(existing?.hours?.let(::formatHours).orEmpty()) }
    var body by rememberSaveable { mutableStateOf(existing?.body.orEmpty()) }

    val dateValid = isIsoDate(date.trim())
    val parsedHours = hours.trim().toDoubleOrNull()
    val hoursValid = hours.isBlank() || (parsedHours != null && parsedHours >= 0)
    val canSave = title.isNotBlank() && dateValid && hoursValid

    val save = {
        val base = existing ?: Report(id = MmiViewModel.newId(), authorId = me.id, title = "", date = "")
        onSave(
            base.copy(
                title = title.trim(),
                type = type,
                date = date.trim(),
                hours = parsedHours,
                body = body.trim(),
            ),
        )
    }

    Scaffold(
        topBar = {
            DetailTopBar(if (isNew) "New report" else "Edit report", onBack) {
                IconButton(onClick = save, enabled = canSave) {
                    Icon(Icons.Filled.Check, contentDescription = "Save")
                }
            }
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Type", style = MaterialTheme.typography.titleSmall)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ReportType.entries.forEach {
                    FilterChip(selected = type == it, onClick = { type = it }, label = { Text(it.label) })
                }
            }
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date") },
                    placeholder = { Text("YYYY-MM-DD") },
                    isError = !dateValid,
                    supportingText = if (!dateValid) ({ Text("Use YYYY-MM-DD") }) else null,
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = hours,
                    onValueChange = { hours = it },
                    label = { Text("Hours") },
                    isError = !hoursValid,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f),
                )
            }
            OutlinedTextField(
                value = body,
                onValueChange = { body = it },
                label = { Text("Details") },
                placeholder = { Text("What was done, where, equipment used, follow-ups…") },
                minLines = 6,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

private fun isIsoDate(value: String): Boolean = try {
    LocalDate.parse(value)
    true
} catch (e: DateTimeParseException) {
    false
}
