package com.mmi.members.data

import kotlinx.serialization.Serializable

/** Everything the app stores, persisted as a single JSON document. */
@Serializable
data class AppData(
    val schemaVersion: Int = 1,
    val activeMemberId: String? = null,
    val members: List<Member> = emptyList(),
    val goals: List<Goal> = emptyList(),
    val reports: List<Report> = emptyList(),
)

@Serializable
data class Member(
    val id: String,
    val name: String,
    val roles: List<String>,
    val title: String = "",
    val email: String = "",
    val phone: String = "",
    val bio: String = "",
    val certifications: List<String> = emptyList(),
    /** ARGB color used for the member's avatar. */
    val color: Long = 0xFF1F3A5FL,
) {
    val initials: String
        get() = name.split(" ").filter { it.isNotBlank() }.take(2)
            .joinToString("") { it.first().uppercase() }
}

@Serializable
enum class GoalStatus(val label: String) {
    NOT_STARTED("Not started"),
    IN_PROGRESS("In progress"),
    COMPLETE("Complete"),
}

@Serializable
enum class GoalCategory(val label: String) {
    MEASUREMENT_CANADA("Measurement Canada"),
    TSSA("TSSA"),
    EQUIPMENT("Equipment"),
    ADMIN("Admin"),
    BUSINESS("Business"),
    OTHER("Other"),
}

@Serializable
data class ChecklistItem(
    val id: String,
    val text: String,
    val done: Boolean = false,
)

@Serializable
data class Goal(
    val id: String,
    val title: String,
    val description: String = "",
    val category: GoalCategory = GoalCategory.OTHER,
    /** Members responsible for the goal. Empty means it belongs to the whole team. */
    val ownerIds: List<String> = emptyList(),
    val status: GoalStatus = GoalStatus.NOT_STARTED,
    /** Free-form target, e.g. "2027-04" or "2026-12-31". ISO-style strings sort correctly. */
    val targetDate: String = "",
    val checklist: List<ChecklistItem> = emptyList(),
) {
    val isTeamGoal: Boolean get() = ownerIds.isEmpty()

    fun isAssignedTo(memberId: String): Boolean = isTeamGoal || memberId in ownerIds

    /** Fraction complete, from the checklist when there is one, otherwise from the status. */
    val progress: Float
        get() = when {
            status == GoalStatus.COMPLETE -> 1f
            checklist.isNotEmpty() -> checklist.count { it.done }.toFloat() / checklist.size
            else -> 0f
        }
}

@Serializable
enum class ReportType(val label: String) {
    FIELD("Field work"),
    INSPECTION("Inspection"),
    TRAINING("Training"),
    ADMIN("Admin"),
    OTHER("Other"),
}

@Serializable
data class Report(
    val id: String,
    val authorId: String,
    val type: ReportType = ReportType.FIELD,
    val title: String,
    /** ISO date, yyyy-MM-dd. */
    val date: String,
    val hours: Double? = null,
    val body: String = "",
)
