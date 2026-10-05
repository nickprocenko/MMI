package com.mmi.members.data

/**
 * Built-in content shipped with the app: the three MMI members and starter goals
 * taken from the fuels certification roadmap (MMI_Roadmap/ in this repository).
 */
object SeedData {

    const val PETER = "peter"
    const val VALEITA = "valeita"
    const val NICK = "nick"

    val members = listOf(
        Member(
            id = PETER,
            name = "Peter",
            roles = listOf("Owner", "Technician"),
            title = "Owner / Technician",
            color = 0xFF1E88E5L,
        ),
        Member(
            id = VALEITA,
            name = "Valeita",
            roles = listOf("Owner", "Admin"),
            title = "Owner / Admin",
            color = 0xFF8E24AAL,
        ),
        Member(
            id = NICK,
            name = "Nick",
            roles = listOf("Owner", "Technician"),
            title = "Owner / Technician",
            color = 0xFFEF6C00L,
        ),
    )

    private val technicians = listOf(PETER, NICK)

    private fun checklist(prefix: String, vararg items: Pair<String, Boolean>) =
        items.mapIndexed { i, (text, done) -> ChecklistItem("$prefix-$i", text, done) }

    val goals = listOf(
        Goal(
            id = "mc-practical",
            title = "MC Practical Evaluation — Bulk & Retail Petroleum",
            description = "Field practical with Measurement Canada (Stoney Creek). " +
                "Required before MMI can inspect and certify retail dispensers and bulk plant meters.",
            category = GoalCategory.MEASUREMENT_CANADA,
            ownerIds = technicians,
            status = GoalStatus.IN_PROGRESS,
            targetDate = "2027-04",
            checklist = checklist(
                "mc-practical",
                "Theoretical evaluation passed (File ID 26535-M20)" to true,
                "Request practical evaluation scheduling with the regional office" to false,
                "Secure a booking date in April 2027" to false,
                "Complete field practical evaluation" to false,
                "Receive confirmation of successful practical" to false,
            ),
        ),
        Goal(
            id = "tssa-pmh",
            title = "Petroleum Mechanic Helper (PMH)",
            description = "TSSA, online and self-paced. Mandatory gate to PM.1 / PM.2 / PM.3. \$507.37 incl. HST.",
            category = GoalCategory.TSSA,
            ownerIds = technicians,
            targetDate = "2026-12",
            checklist = checklist(
                "tssa-pmh",
                "Enroll in PMH course" to false,
                "Complete course modules" to false,
                "Pass exam" to false,
                "TSSA certificate number received" to false,
            ),
        ),
        Goal(
            id = "tssa-lfhc",
            title = "Liquid Fuels Handling Code 2017",
            description = "TSSA. Requires an existing TSSA cert number to enroll (PMH qualifies). ~\$198 incl. HST.",
            category = GoalCategory.TSSA,
            ownerIds = technicians,
            targetDate = "2027-01",
            checklist = checklist(
                "tssa-lfhc",
                "PMH certificate in hand" to false,
                "Enroll" to false,
                "Pass exam" to false,
            ),
        ),
        Goal(
            id = "tssa-site-operator",
            title = "Site Operator — Retail",
            description = "TSSA. Operate retail fuel dispensing sites. ~\$372 incl. HST.",
            category = GoalCategory.TSSA,
            ownerIds = technicians,
            targetDate = "2027-03",
        ),
        Goal(
            id = "tssa-pm1",
            title = "Petroleum Equipment Mechanic PM.1",
            description = "Service and maintain dispensers and submersible pumps. Requires PMH and 1,000 field hours.",
            category = GoalCategory.TSSA,
            ownerIds = technicians,
            targetDate = "2027-06",
            checklist = checklist(
                "tssa-pm1",
                "PMH certificate in hand" to false,
                "Arrange field hours with a local contractor" to false,
                "Log 1,000 field hours" to false,
                "Pass PM.1 exam" to false,
            ),
        ),
        Goal(
            id = "equipment-20l",
            title = "Recognized 20 L test measure",
            description = "Purchase an MC-recognized 20 L measure and have it designated as a local standard.",
            category = GoalCategory.EQUIPMENT,
            targetDate = "2027-03",
            checklist = checklist(
                "equipment-20l",
                "Confirm with MC which local standards MMI must own" to false,
                "Purchase recognized 20 L measure" to false,
                "Verification and local-standard designation" to false,
            ),
        ),
        Goal(
            id = "admin-schedule-a",
            title = "MC registration & Schedule A records",
            description = "Keep MMI's Measurement Canada registration active and Schedule A records filed.",
            category = GoalCategory.ADMIN,
            ownerIds = listOf(VALEITA),
            status = GoalStatus.IN_PROGRESS,
            targetDate = "2027-05",
            checklist = checklist(
                "admin-schedule-a",
                "Confirm registration status is active with Measurement Canada" to false,
                "File theoretical evaluation letter and record" to false,
                "File practical evaluation confirmation letter" to false,
                "Obtain and file updated Schedule A" to false,
            ),
        ),
        Goal(
            id = "business-first-client",
            title = "First client inspection under MMI's Schedule A",
            description = "Land the first inspection, then recurring bi-annual inspection contracts.",
            category = GoalCategory.BUSINESS,
            targetDate = "2027-06",
            checklist = checklist(
                "business-first-client",
                "Authorized to inspect retail fuel dispensers" to false,
                "Authorized to inspect bulk plant meters" to false,
                "First client inspection completed" to false,
                "Recurring bi-annual contracts established" to false,
            ),
        ),
    )

    fun initialData() = AppData(members = members, goals = goals)
}
