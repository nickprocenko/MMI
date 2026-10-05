@file:OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)

package com.mmi.members.ui.screens

import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.mmi.members.data.AppData
import com.mmi.members.data.Goal
import com.mmi.members.data.GoalCategory
import com.mmi.members.data.GoalStatus
import com.mmi.members.data.Member
import com.mmi.members.ui.MmiViewModel
import com.mmi.members.ui.Routes
import com.mmi.members.ui.components.DetailTopBar
import com.mmi.members.ui.components.EmptyState
import com.mmi.members.ui.components.GoalCard
import com.mmi.members.ui.components.MainTopBar
import com.mmi.members.ui.components.OwnerAvatars
import com.mmi.members.ui.components.SectionHeader
import com.mmi.members.ui.components.StatusBadge
import com.mmi.members.ui.components.Tag

private enum class GoalScope(val label: String) { MINE("Mine"), TEAM("Team"), ALL("All") }

@Composable
fun GoalsScreen(
    data: AppData,
    me: Member,
    onOpenProfile: () -> Unit,
    onOpenGoal: (String) -> Unit,
    onNewGoal: () -> Unit,
) {
    var scope by rememberSaveable { mutableStateOf(GoalScope.MINE) }
    var showCompleted by rememberSaveable { mutableStateOf(true) }

    val goals = data.goals
        .filter {
            when (scope) {
                GoalScope.MINE -> it.isAssignedTo(me.id)
                GoalScope.TEAM -> it.isTeamGoal
                GoalScope.ALL -> true
            }
        }
        .filter { showCompleted || it.status != GoalStatus.COMPLETE }
        .sortedWith(compareBy({ it.status == GoalStatus.COMPLETE }, { it.targetDate.isBlank() }, { it.targetDate }))

    Scaffold(
        topBar = { MainTopBar("Goals", me, onOpenProfile) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNewGoal,
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("New goal") },
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
                    GoalScope.entries.forEach {
                        FilterChip(selected = scope == it, onClick = { scope = it }, label = { Text(it.label) })
                    }
                    FilterChip(
                        selected = showCompleted,
                        onClick = { showCompleted = !showCompleted },
                        label = { Text("Show completed") },
                    )
                }
            }
            if (goals.isEmpty()) item { EmptyState("No goals here yet.") }
            items(goals, key = { it.id }) { goal ->
                GoalCard(goal, data.members, onClick = { onOpenGoal(goal.id) })
            }
        }
    }
}

@Composable
fun GoalDetailScreen(
    goalId: String,
    data: AppData,
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onDelete: (String) -> Unit,
    onSetStatus: (String, GoalStatus) -> Unit,
    onToggleItem: (String, String) -> Unit,
    onAddItem: (String, String) -> Unit,
    onRemoveItem: (String, String) -> Unit,
) {
    val goal = data.goals.find { it.id == goalId }
    var confirmDelete by remember { mutableStateOf(false) }
    var newItem by rememberSaveable { mutableStateOf("") }

    Scaffold(
        topBar = {
            DetailTopBar("Goal", onBack) {
                if (goal != null) {
                    IconButton(onClick = { onEdit(goal.id) }) { Icon(Icons.Filled.Edit, contentDescription = "Edit") }
                    IconButton(onClick = { confirmDelete = true }) { Icon(Icons.Filled.Delete, contentDescription = "Delete") }
                }
            }
        },
    ) { padding ->
        if (goal == null) {
            EmptyState("This goal no longer exists.", Modifier.padding(padding).padding(16.dp))
            return@Scaffold
        }
        val submitItem = {
            if (newItem.isNotBlank()) {
                onAddItem(goal.id, newItem)
                newItem = ""
            }
        }
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Tag(goal.category.label)
                    Spacer(Modifier.weight(1f))
                    StatusBadge(goal.status)
                }
                Spacer(Modifier.height(8.dp))
                Text(goal.title, style = MaterialTheme.typography.headlineSmall)
                if (goal.description.isNotBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(goal.description, style = MaterialTheme.typography.bodyMedium)
                }
                Spacer(Modifier.height(12.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OwnerAvatars(goal, data.members)
                    Spacer(Modifier.weight(1f))
                    if (goal.targetDate.isNotBlank()) Text("Target ${goal.targetDate}", style = MaterialTheme.typography.bodySmall)
                }
                Spacer(Modifier.height(12.dp))
                LinearProgressIndicator(progress = { goal.progress }, modifier = Modifier.fillMaxWidth())

                SectionHeader("Status")
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GoalStatus.entries.forEach { status ->
                        FilterChip(
                            selected = goal.status == status,
                            onClick = { onSetStatus(goal.id, status) },
                            label = { Text(status.label) },
                        )
                    }
                }
                SectionHeader("Checklist (${goal.checklist.count { it.done }}/${goal.checklist.size})")
            }
            items(goal.checklist, key = { it.id }) { item ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .clickable { onToggleItem(goal.id, item.id) },
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(checked = item.done, onCheckedChange = { onToggleItem(goal.id, item.id) })
                    Text(
                        item.text,
                        modifier = Modifier.weight(1f),
                        textDecoration = if (item.done) TextDecoration.LineThrough else null,
                        color = if (item.done) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                    )
                    IconButton(onClick = { onRemoveItem(goal.id, item.id) }) {
                        Icon(Icons.Filled.Close, contentDescription = "Remove step")
                    }
                }
            }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = newItem,
                        onValueChange = { newItem = it },
                        placeholder = { Text("Add a step") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { submitItem() }),
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = submitItem, enabled = newItem.isNotBlank()) {
                        Icon(Icons.Filled.Add, contentDescription = "Add step")
                    }
                }
            }
        }
    }

    if (confirmDelete && goal != null) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Delete goal?") },
            text = { Text("\"${goal.title}\" and its checklist will be removed.") },
            confirmButton = {
                TextButton(onClick = { confirmDelete = false; onDelete(goal.id) }) { Text("Delete") }
            },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancel") } },
        )
    }
}

@Composable
fun GoalEditScreen(
    goalId: String,
    data: AppData,
    me: Member,
    onBack: () -> Unit,
    onSave: (Goal) -> Unit,
) {
    val existing = data.goals.find { it.id == goalId }
    val isNew = goalId == Routes.NEW || existing == null

    var title by rememberSaveable { mutableStateOf(existing?.title.orEmpty()) }
    var description by rememberSaveable { mutableStateOf(existing?.description.orEmpty()) }
    var targetDate by rememberSaveable { mutableStateOf(existing?.targetDate.orEmpty()) }
    var category by rememberSaveable { mutableStateOf(existing?.category ?: GoalCategory.OTHER) }
    var owners by rememberSaveable { mutableStateOf(existing?.ownerIds ?: listOf(me.id)) }

    val save = {
        val base = existing ?: Goal(id = MmiViewModel.newId(), title = "")
        onSave(
            base.copy(
                title = title.trim(),
                description = description.trim(),
                targetDate = targetDate.trim(),
                category = category,
                ownerIds = owners,
            ),
        )
    }

    Scaffold(
        topBar = {
            DetailTopBar(if (isNew) "New goal" else "Edit goal", onBack) {
                IconButton(onClick = save, enabled = title.isNotBlank()) {
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
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = targetDate,
                onValueChange = { targetDate = it },
                label = { Text("Target date") },
                placeholder = { Text("e.g. 2027-04") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            Text("Category", style = MaterialTheme.typography.titleSmall)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                GoalCategory.entries.forEach {
                    FilterChip(selected = category == it, onClick = { category = it }, label = { Text(it.label) })
                }
            }

            Text("Assigned to", style = MaterialTheme.typography.titleSmall)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = owners.isEmpty(), onClick = { owners = emptyList() }, label = { Text("Whole team") })
                data.members.forEach { member ->
                    FilterChip(
                        selected = member.id in owners,
                        onClick = { owners = if (member.id in owners) owners - member.id else owners + member.id },
                        label = { Text(member.name) },
                    )
                }
            }
            if (isNew) {
                Text(
                    "Add checklist steps from the goal page after saving.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
