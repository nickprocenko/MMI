package com.mmi.members.ui

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.mmi.members.ui.screens.GoalDetailScreen
import com.mmi.members.ui.screens.GoalEditScreen
import com.mmi.members.ui.screens.GoalsScreen
import com.mmi.members.ui.screens.HomeScreen
import com.mmi.members.ui.screens.ProfileEditScreen
import com.mmi.members.ui.screens.ProfileScreen
import com.mmi.members.ui.screens.ProfileSelectScreen
import com.mmi.members.ui.screens.ReportDetailScreen
import com.mmi.members.ui.screens.ReportEditScreen
import com.mmi.members.ui.screens.ReportsScreen
import com.mmi.members.ui.screens.TeamScreen

/** Navigation routes. Ids are passed as path segments; "new" means create. */
object Routes {
    const val HOME = "home"
    const val GOALS = "goals"
    const val REPORTS = "reports"
    const val TEAM = "team"
    const val NEW = "new"

    fun goal(id: String) = "goal/$id"
    fun goalEdit(id: String = NEW) = "goal/$id/edit"
    fun report(id: String) = "report/$id"
    fun reportEdit(id: String = NEW) = "report/$id/edit"
    fun profile(id: String) = "profile/$id"
    fun profileEdit(id: String) = "profile/$id/edit"
}

private data class TopLevel(val route: String, val label: String, val icon: ImageVector)

private val topLevel = listOf(
    TopLevel(Routes.HOME, "Home", Icons.Filled.Home),
    TopLevel(Routes.GOALS, "Goals", Icons.Filled.Flag),
    TopLevel(Routes.REPORTS, "Reports", Icons.Filled.Description),
    TopLevel(Routes.TEAM, "Team", Icons.Filled.Groups),
)

@Composable
fun MmiApp(vm: MmiViewModel = viewModel()) {
    val data by vm.data.collectAsStateWithLifecycle()
    val active = data.members.find { it.id == data.activeMemberId }

    if (active == null) {
        ProfileSelectScreen(members = data.members, onSelect = vm::signIn)
        return
    }

    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        bottomBar = {
            if (topLevel.any { it.route == currentRoute }) {
                NavigationBar {
                    topLevel.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.route,
                            onClick = { nav.navigateTopLevel(item.route) },
                            icon = { Icon(item.icon, contentDescription = null) },
                            label = { Text(item.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.HOME,
            modifier = Modifier
                .padding(padding)
                .consumeWindowInsets(padding),
        ) {
            val back: () -> Unit = { nav.popBackStack() }
            val openProfile: () -> Unit = { nav.navigate(Routes.profile(active.id)) }

            composable(Routes.HOME) {
                HomeScreen(
                    data = data,
                    me = active,
                    onOpenProfile = openProfile,
                    onSwitchUser = vm::signOut,
                    onOpenGoal = { nav.navigate(Routes.goal(it)) },
                    onOpenReport = { nav.navigate(Routes.report(it)) },
                    onNewReport = { nav.navigate(Routes.reportEdit()) },
                    onNewGoal = { nav.navigate(Routes.goalEdit()) },
                    onSeeGoals = { nav.navigateTopLevel(Routes.GOALS) },
                    onSeeReports = { nav.navigateTopLevel(Routes.REPORTS) },
                )
            }
            composable(Routes.GOALS) {
                GoalsScreen(
                    data = data,
                    me = active,
                    onOpenProfile = openProfile,
                    onOpenGoal = { nav.navigate(Routes.goal(it)) },
                    onNewGoal = { nav.navigate(Routes.goalEdit()) },
                )
            }
            composable("goal/{id}") { entry ->
                GoalDetailScreen(
                    goalId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    onBack = back,
                    onEdit = { nav.navigate(Routes.goalEdit(it)) },
                    onDelete = { vm.deleteGoal(it); back() },
                    onSetStatus = vm::setGoalStatus,
                    onToggleItem = vm::toggleChecklistItem,
                    onAddItem = vm::addChecklistItem,
                    onRemoveItem = vm::removeChecklistItem,
                )
            }
            composable("goal/{id}/edit") { entry ->
                GoalEditScreen(
                    goalId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    me = active,
                    onBack = back,
                    onSave = { vm.saveGoal(it); back() },
                )
            }
            composable(Routes.REPORTS) {
                ReportsScreen(
                    data = data,
                    onOpenProfile = openProfile,
                    me = active,
                    onOpenReport = { nav.navigate(Routes.report(it)) },
                    onNewReport = { nav.navigate(Routes.reportEdit()) },
                )
            }
            composable("report/{id}") { entry ->
                ReportDetailScreen(
                    reportId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    onBack = back,
                    onEdit = { nav.navigate(Routes.reportEdit(it)) },
                    onDelete = { vm.deleteReport(it); back() },
                )
            }
            composable("report/{id}/edit") { entry ->
                ReportEditScreen(
                    reportId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    me = active,
                    onBack = back,
                    onSave = { vm.saveReport(it); back() },
                )
            }
            composable(Routes.TEAM) {
                TeamScreen(
                    data = data,
                    me = active,
                    onOpenProfile = openProfile,
                    onOpenMember = { nav.navigate(Routes.profile(it)) },
                )
            }
            composable("profile/{id}") { entry ->
                ProfileScreen(
                    memberId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    me = active,
                    onBack = back,
                    onEdit = { nav.navigate(Routes.profileEdit(it)) },
                    onSwitchUser = vm::signOut,
                    onOpenGoal = { nav.navigate(Routes.goal(it)) },
                    onOpenReport = { nav.navigate(Routes.report(it)) },
                )
            }
            composable("profile/{id}/edit") { entry ->
                ProfileEditScreen(
                    memberId = entry.arguments?.getString("id").orEmpty(),
                    data = data,
                    onBack = back,
                    onSave = { vm.saveMember(it); back() },
                )
            }
        }
    }
}

private fun NavHostController.navigateTopLevel(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
