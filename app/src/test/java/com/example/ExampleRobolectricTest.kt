package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.model.FoldPostureMode
import com.example.model.MiloPoseState
import com.example.viewmodel.FoldStudioViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Milo (마일로)", appName)
    }

    @Test
    fun `viewmodel handles 3-minute live demo scenarios and posture modes`() {
        val viewModel = FoldStudioViewModel()
        assertEquals(FoldPostureMode.UNFOLDED_DUAL, viewModel.uiState.value.postureMode)

        viewModel.runDemoScenario1_Glp1AndNausea()
        assertEquals(MiloPoseState.SAD_WORRIED, viewModel.uiState.value.activePose)

        viewModel.runDemoScenario2_ZeroEffortMeal()
        assertEquals(MiloPoseState.MEAL_CHECK, viewModel.uiState.value.activePose)

        viewModel.confirmZeroEffortItem("ze_poke")
        assertTrue(viewModel.uiState.value.zeroEffortItems.first { it.id == "ze_poke" }.isConfirmed)
    }
}
