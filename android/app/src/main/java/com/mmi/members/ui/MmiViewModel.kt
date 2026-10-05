package com.mmi.members.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.mmi.members.MmiApplication
import com.mmi.members.data.AppData
import com.mmi.members.data.ChecklistItem
import com.mmi.members.data.Goal
import com.mmi.members.data.GoalStatus
import com.mmi.members.data.Member
import com.mmi.members.data.Report
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

class MmiViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = (application as MmiApplication).repository
    val data: StateFlow<AppData> = repository.data

    fun signIn(memberId: String) = repository.update { it.copy(activeMemberId = memberId) }

    fun signOut() = repository.update { it.copy(activeMemberId = null) }

    fun saveMember(member: Member) = repository.update { data ->
        data.copy(members = data.members.map { if (it.id == member.id) member else it })
    }

    fun saveGoal(goal: Goal) = repository.update { data ->
        val exists = data.goals.any { it.id == goal.id }
        data.copy(goals = if (exists) data.goals.map { if (it.id == goal.id) goal else it } else data.goals + goal)
    }

    fun deleteGoal(goalId: String) = repository.update { data ->
        data.copy(goals = data.goals.filterNot { it.id == goalId })
    }

    fun setGoalStatus(goalId: String, status: GoalStatus) = updateGoal(goalId) { it.copy(status = status) }

    fun toggleChecklistItem(goalId: String, itemId: String) = updateGoal(goalId) { goal ->
        goal.withChecklist(goal.checklist.map { if (it.id == itemId) it.copy(done = !it.done) else it })
    }

    fun addChecklistItem(goalId: String, text: String) = updateGoal(goalId) { goal ->
        goal.withChecklist(goal.checklist + ChecklistItem(newId(), text.trim()))
    }

    fun removeChecklistItem(goalId: String, itemId: String) = updateGoal(goalId) { goal ->
        goal.withChecklist(goal.checklist.filterNot { it.id == itemId })
    }

    fun saveReport(report: Report) = repository.update { data ->
        val exists = data.reports.any { it.id == report.id }
        data.copy(reports = if (exists) data.reports.map { if (it.id == report.id) report else it } else data.reports + report)
    }

    fun deleteReport(reportId: String) = repository.update { data ->
        data.copy(reports = data.reports.filterNot { it.id == reportId })
    }

    private fun updateGoal(goalId: String, transform: (Goal) -> Goal) = repository.update { data ->
        data.copy(goals = data.goals.map { if (it.id == goalId) transform(it) else it })
    }

    /** Keeps the status in step with the checklist: any progress starts it, all done completes it. */
    private fun Goal.withChecklist(items: List<ChecklistItem>): Goal {
        val done = items.count { it.done }
        val status = when {
            items.isNotEmpty() && done == items.size -> GoalStatus.COMPLETE
            done > 0 -> GoalStatus.IN_PROGRESS
            status == GoalStatus.COMPLETE -> GoalStatus.IN_PROGRESS
            else -> status
        }
        return copy(checklist = items, status = status)
    }

    companion object {
        fun newId(): String = UUID.randomUUID().toString()
    }
}
