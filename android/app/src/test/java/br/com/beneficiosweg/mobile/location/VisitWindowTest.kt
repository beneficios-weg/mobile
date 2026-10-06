package br.com.beneficiosweg.mobile.location

import org.junit.Assert.*
import org.junit.Test

class VisitWindowTest {
    private val rules = VisitRules(30_000, 20.0, 2.0, 10_000, 4)
    @Test fun requiresContinuousAccurateDwell() {
        val window = VisitWindow(rules)
        for (time in 0L..20_000L step 5_000) assertFalse(window.sample(time, 10.0, 60.0, 5.0, 0.0))
        assertFalse(window.sample(25_000, 10.0, 60.0, 100.0, 0.0))
        for (time in 30_000L..55_000L step 5_000) assertFalse(window.sample(time, 10.0, 60.0, 5.0, 0.0))
        assertTrue(window.sample(60_000, 10.0, 60.0, 5.0, 0.0))
    }
    @Test fun gapAndMotionInvalidateWindow() {
        val window = VisitWindow(rules)
        assertFalse(window.sample(0, 10.0, 60.0, 5.0, 0.0))
        assertFalse(window.sample(30_000, 10.0, 60.0, 5.0, 0.0))
        assertFalse(window.sample(35_000, 10.0, 60.0, 5.0, 8.0))
        assertFalse(window.sample(40_000, 10.0, 60.0, 5.0, 0.0))
    }
    @Test fun uncertainBoundaryDoesNotConfirm() {
        val window = VisitWindow(rules)
        for (time in 0L..60_000L step 5_000) assertFalse(window.sample(time, 58.0, 60.0, 5.0, 0.0))
        assertFalse(window.sample(65_000, Double.NaN, 60.0, 5.0, 0.0))
    }
}
