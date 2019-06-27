class Randomizer {
  constructor() {
    this.init();
  }
  init() {
    this.seedA = 1000003;
    this.seedB = 73819;
  }
  /**
   * Get pseudorandom number bit perturbation
   * used in random sequence generator
   * 
   * @param {number} val - input integer
   */
  static xorShift(val) {
    val ^= val << 13;
    val ^= val >> 17;
    val ^= val << 5;
    return val;
  }
  /**
   * Get next random value
   * @return {number} integer in range [0.65535]
   */
  getNextRand() {
    const a = Randomizer.xorShift(this.seedB);
    const b = Randomizer.xorShift(this.seedA);
    this.seedA = a;
    this.seedB = b;
    return (this.seedA ^ this.seedB) & 0xffff;
  }
}
export default Randomizer;
