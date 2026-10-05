@file:OptIn(ExperimentalMaterial3Api::class)

package com.mmi.members.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.NoteAdd
import androidx.compose.material.icons.filled.AddTask
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mmi.members.data.AppData
import com.mmi.members.data.GoalStatus
import com.mmi.members.data.Member
import com.mmi.members.ui.components.EmptyState
import com.mmi.members.ui.components.GoalCard
import com.mmi.members.ui.components.MemberAvatar
import com.mmi.members.ui.components.ReportCard
import com.mmi.members.ui.components.SectionHeader
import java.time.LocalDate
import java.time.LocalTime
import kotlin.math.roundToInt

@Composable
fun HomeScreen(
    data: AppData,
    me: Member,
    onOpenProfile: () -> Unit,
    onSwitchUser: () -> Unit,
    onOpenGoal: (String) -> Unit,
    onOpenReport: (String) -> Unit,
    onNewReport: () -> Unit,
    onNewGoal: () -> Unit,
    onSeeGoals: () -> Unit,
    onSeeReports: () -> Unit,
) {
    val myGoals = data.goals.filter { it.isAssignedTo(me.id) }
    val myOpenGoals = myGoals.filter { it.status != GoalStatus.COMPLETE }
    val thisMonth = LocalDate.now().toString().take(7)
    val myReportsThisMonth = data.reports.count { it.authorId == me.id && it.date.startsWith(thisMonth) }
    val teamProgress = if (data.goals.isEmpty()) 0f else data.goals.map { it.progress }.average().toFloat()
    val upcoming = myOpenGoals.sortedWith(compareBy({ it.targetDate.isBlank() }, { it.targetDate })).take(3)
    val recentReports = data.reports.sortedByDescending { it.date }.take(3)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("MMI") },
                actions = {
                    IconButton(onClick = onSwitchUser) {
                        Icon(Icons.Filled.SwapHoriz, contentDescription = "Switch profile")
                    }
                    IconButton(onClick = onOpenProfile) { MemberAvatar(me, size = 32.dp) }
                },
            )
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
        ) {
            Text(greeting() + ", ${me.name}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(me.title, color = MaterialTheme.colorScheme.onSurfaceVariant)

            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatTile("Open goals", myOpenGoals.size.toString(), Modifier.weight(1f))
                StatTile("Completed", myGoals.count { it.status == GoalStatus.COMPLETE }.toString(), Modifier.weight(1f))
                StatTile("Reports this month", myReportsThisMonth.toString(), Modifier.weight(1f))
            }

            Spacer(Modifier.height(12.dp))
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Team roadmap progress", style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                        Text("${(teamProgress * 100).roundToInt()}%", style = MaterialTheme.typography.titleSmall)
                    }
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(progress = { teamProgress }, modifier = Modifier.fillMaxWidth())
                }
            }

            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FilledTonalButton(onClick = onNewReport, modifier = Modifier.weight(1f)) {
                    Icon(Icons.AutoMirrored.Filled.NoteAdd, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("New report")
                }
                FilledTonalButton(onClick = onNewGoal, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Filled.AddTask, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("New goal")
                }
            }

            HeaderWithLink("My next targets", "All goals", onSeeGoals)
            if (upcoming.isEmpty()) EmptyState("Nothing open — nice work.")
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                upcoming.forEach { goal -> GoalCard(goal, data.members, onClick = { onOpenGoal(goal.id) }) }
            }

            HeaderWithLink("Recent reports", "All reports", onSeeReports)
            if (recentReports.isEmpty()) EmptyState("No reports yet. Log field work, inspections or training.")
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                recentReports.forEach { report ->
                    ReportCard(report, data.members.find { it.id == report.authorId }, onClick = { onOpenReport(report.id) })
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(label, style = MaterialTheme.typography.labelSmall, minLines = 2)
        }
    }
}

@Composable
private fun HeaderWithLink(title: String, link: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        SectionHeader(title, Modifier.weight(1f))
        TextButton(onClick = onClick, modifier = Modifier.padding(top = 8.dp)) { Text(link) }
    }
}

private fun greeting(): String = when (LocalTime.now().hour) {
    in 5..11 -> "Good morning"
    in 12..16 -> "Good afternoon"
    else -> "Good evening"
}
