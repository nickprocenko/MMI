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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.mmi.members.data.AppData
import com.mmi.members.data.GoalStatus
import com.mmi.members.data.Member
import com.mmi.members.ui.components.DetailTopBar
import com.mmi.members.ui.components.EmptyState
import com.mmi.members.ui.components.GoalCard
import com.mmi.members.ui.components.MainTopBar
import com.mmi.members.ui.components.MemberAvatar
import com.mmi.members.ui.components.ReportCard
import com.mmi.members.ui.components.SectionHeader
import com.mmi.members.ui.components.Tag

@Composable
fun TeamScreen(
    data: AppData,
    me: Member,
    onOpenProfile: () -> Unit,
    onOpenMember: (String) -> Unit,
) {
    Scaffold(topBar = { MainTopBar("Team", me, onOpenProfile) }) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(data.members, key = { it.id }) { member ->
                val open = data.goals.count { it.isAssignedTo(member.id) && it.status != GoalStatus.COMPLETE }
                val reports = data.reports.count { it.authorId == member.id }
                Card(onClick = { onOpenMember(member.id) }, modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        MemberAvatar(member, size = 52.dp)
                        Spacer(Modifier.width(16.dp))
                        Column(Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(member.name, style = MaterialTheme.typography.titleMedium)
                                if (member.id == me.id) {
                                    Spacer(Modifier.width(8.dp))
                                    Tag("You")
                                }
                            }
                            Text(member.title, style = MaterialTheme.typography.bodyMedium)
                            Text(
                                "$open open goals · $reports reports",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(
    memberId: String,
    data: AppData,
    me: Member,
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onSwitchUser: () -> Unit,
    onOpenGoal: (String) -> Unit,
    onOpenReport: (String) -> Unit,
) {
    val member = data.members.find { it.id == memberId }

    Scaffold(
        topBar = {
            DetailTopBar("Profile", onBack) {
                if (member != null) {
                    IconButton(onClick = { onEdit(member.id) }) { Icon(Icons.Filled.Edit, contentDescription = "Edit profile") }
                }
            }
        },
    ) { padding ->
        if (member == null) {
            EmptyState("Member not found.", Modifier.padding(padding).padding(16.dp))
            return@Scaffold
        }
        val goals = data.goals.filter { it.ownerIds.contains(member.id) && it.status != GoalStatus.COMPLETE }
        val reports = data.reports.filter { it.authorId == member.id }.sortedByDescending { it.date }

        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
        ) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                MemberAvatar(member, size = 96.dp)
                Spacer(Modifier.height(12.dp))
                Text(member.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                if (member.title.isNotBlank()) Text(member.title, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) { member.roles.forEach { Tag(it) } }
                if (member.id == me.id) {
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = onSwitchUser) {
                        Icon(Icons.Filled.SwapHoriz, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Switch profile")
                    }
                }
            }

            SectionHeader("Contact")
            if (member.email.isBlank() && member.phone.isBlank()) {
                Text("No contact details yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (member.email.isNotBlank()) InfoRow(Icons.Filled.Email, member.email)
            if (member.phone.isNotBlank()) InfoRow(Icons.Filled.Phone, member.phone)

            if (member.bio.isNotBlank()) {
                SectionHeader("About")
                Text(member.bio)
            }

            SectionHeader("Certifications")
            if (member.certifications.isEmpty()) {
                Text("None added yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            member.certifications.forEach { InfoRow(Icons.Filled.Verified, it) }

            SectionHeader("Assigned goals (${goals.size} open)")
            if (goals.isEmpty()) Text("No individually assigned open goals.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                goals.forEach { goal -> GoalCard(goal, data.members, onClick = { onOpenGoal(goal.id) }) }
            }

            SectionHeader("Reports (${reports.size})")
            if (reports.isEmpty()) Text("No reports yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                reports.take(5).forEach { report -> ReportCard(report, member, onClick = { onOpenReport(report.id) }) }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun InfoRow(icon: ImageVector, text: String) {
    Row(Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.width(12.dp))
        Text(text)
    }
}

@Composable
fun ProfileEditScreen(
    memberId: String,
    data: AppData,
    onBack: () -> Unit,
    onSave: (Member) -> Unit,
) {
    val member = data.members.find { it.id == memberId }
    if (member == null) {
        Scaffold(topBar = { DetailTopBar("Edit profile", onBack) }) { padding ->
            EmptyState("Member not found.", Modifier.padding(padding).padding(16.dp))
        }
        return
    }

    var name by rememberSaveable { mutableStateOf(member.name) }
    var title by rememberSaveable { mutableStateOf(member.title) }
    var roles by rememberSaveable { mutableStateOf(member.roles.joinToString(", ")) }
    var email by rememberSaveable { mutableStateOf(member.email) }
    var phone by rememberSaveable { mutableStateOf(member.phone) }
    var bio by rememberSaveable { mutableStateOf(member.bio) }
    var certifications by rememberSaveable { mutableStateOf(member.certifications.joinToString("\n")) }

    val save = {
        onSave(
            member.copy(
                name = name.trim(),
                title = title.trim(),
                roles = roles.split(",").map { it.trim() }.filter { it.isNotEmpty() },
                email = email.trim(),
                phone = phone.trim(),
                bio = bio.trim(),
                certifications = certifications.lines().map { it.trim() }.filter { it.isNotEmpty() },
            ),
        )
    }

    Scaffold(
        topBar = {
            DetailTopBar("Edit profile", onBack) {
                IconButton(onClick = save, enabled = name.isNotBlank()) {
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
            FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                MemberAvatar(member.copy(name = name.ifBlank { member.name }), size = 72.dp)
            }
            ProfileField("Name", name) { name = it }
            ProfileField("Title", title) { title = it }
            ProfileField("Roles (comma separated)", roles) { roles = it }
            ProfileField("Email", email, KeyboardType.Email) { email = it }
            ProfileField("Phone", phone, KeyboardType.Phone) { phone = it }
            OutlinedTextField(
                value = bio,
                onValueChange = { bio = it },
                label = { Text("About") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = certifications,
                onValueChange = { certifications = it },
                label = { Text("Certifications (one per line)") },
                placeholder = { Text("e.g. NTTP Theoretical — Bulk & Retail Petroleum") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun ProfileField(
    label: String,
    value: String,
    keyboardType: KeyboardType = KeyboardType.Text,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        modifier = Modifier.fillMaxWidth(),
    )
}
