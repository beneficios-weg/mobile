package br.com.beneficiosweg.mobile.location

/** Rules must come from reviewed configuration, rather than hard-coded product defaults. */
data class VisitRules(val dwellMs: Long, val maxAccuracy: Double, val maxSpeed: Double, val maxGapMs: Long, val minimumSamples: Int) {
    init {
        require(dwellMs in 30_000..900_000)
        require(maxAccuracy > 0 && maxAccuracy <= 100)
        require(maxSpeed > 0 && maxSpeed <= 10)
        require(maxGapMs in 1_000..60_000)
        require(minimumSamples >= 2)
    }
}

class VisitWindow(private val rules: VisitRules) {
    private var first: Long? = null
    private var last: Long? = null
    private var count = 0
    fun reset() { first = null; last = null; count = 0 }
    fun sample(time: Long, distance: Double, radius: Double, accuracy: Double, speed: Double): Boolean {
        if (!distance.isFinite() || !accuracy.isFinite() || !speed.isFinite() || accuracy < 0 ||
            accuracy > rules.maxAccuracy || speed > rules.maxSpeed || distance + accuracy > radius) {
            reset(); return false
        }
        if (last != null && (time <= last!! || time - last!! > rules.maxGapMs)) reset()
        if (first == null) first = time
        last = time
        count++
        return count >= rules.minimumSamples && time - first!! >= rules.dwellMs
    }
}
