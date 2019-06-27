import Coder from './engine/Coder';

describe('App. tests for coder', () => {

  it('update keys non trivial and non repeated', () => {
    const coder = new Coder();
    coder.init();
    let i;
    // const NUM_ITERS = 1024 * 1024 * 16;
    const NUM_ITERS = 1024;
    for (i = 0; i < NUM_ITERS; i++) {
      coder.updateKeys();
    }
    // check keys are non trivial
    const NUM_KEYS = 16;
    for (i = 0; i < NUM_KEYS; i++) {
      const k = coder.m_keys[i];
      expect(k !== 0).toBeTruthy();
      expect(k !== 0xffffffff).toBeTruthy();
    }
    for (i = 0; i < NUM_KEYS; i++) {
      const k = coder.m_keys[i];
      for (let j = i + 1; j < NUM_KEYS; j++) {
        const m = coder.m_keys[j];
        expect(k !== m).toBeTruthy();
      }
    }

    // console.log(`keys after long updates = ${coder.m_keys[0]},${coder.m_keys[1]},${coder.m_keys[2]},${coder.m_keys[3]}`);
    // console.log(`keys after long updates = ${coder.m_keys[4]},${coder.m_keys[5]},${coder.m_keys[6]},${coder.m_keys[7]}`);
    // console.log(`keys after long updates = ${coder.m_keys[8]},${coder.m_keys[9]},${coder.m_keys[10]},${coder.m_keys[11]}`);
    // console.log(`keys after long updates = ${coder.m_keys[12]},${coder.m_keys[13]},${coder.m_keys[14]},${coder.m_keys[15]}`);
    

  });
  it('check too small image or too large text', () => {
    const coder = new Coder();
    coder.init();
    const STR_PASS = 'SomeText';
    const STR_MSG = 'aaaaaa bbbbbb cccccc ddddddd \
    eeeeee ffffff gggggg hhhhhhh \
    aaaaaa bbbbbb cccccc ddddddd \
    eeeeee ffffff gggggg hhhhhhh \
    aaaaaa bbbbbb cccccc ddddddd';
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, STR_MSG);

    const arrSize = 8 * 8 * 4;
    const arr = new Uint8Array(arrSize);
    const ok = coder.putToArray(arr, arrSize);
    expect(ok).toBeFalsy();
  });

  it('set pass, encode and decode returns original', () => {
    const coder = new Coder();
    coder.init();
    const STR_PASS = 'SomeVeryStrangeTextAndDigits186';
    const STR_MSG = 'Last weekend I have visited area54 \
    complex and was pretty excited about engineering \
    works there: \
    Сергей работает, Паша пашет, а Алексей курит в сторонке!';
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, STR_MSG);

    coder.init();
    coder.setPass(STR_PASS);
    coder.decode();
    const str = coder.getStringFromCode();
    // console.log(`src -> code -> src = ${str}  `);
    expect(str === STR_MSG).toBeTruthy();
  });

  it('rus-ger-kor test: decode returns original', () => {
    const coder = new Coder();
    coder.init();
    const STR_PASS = 'KaravaiBolshoyyy876';
    const STR_MSG = 'Много воды утекло с тех времен. Sie hören nicht die folgenden Gesänge. 축하합니다.';
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, STR_MSG);

    coder.init();
    coder.setPass(STR_PASS);
    coder.decode();
    const str = coder.getStringFromCode();
    // console.log(`src -> code -> src = ${str}  `);
    expect(str === STR_MSG).toBeTruthy();
  });


  it('getNextRand check non repeated', () => {
    const coder = new Coder();
    const NUM_ITERS = 1024;
    const arr = new Uint32Array(NUM_ITERS);
    let i;
    for (i = 0; i < NUM_ITERS; i++) {
      const rnd = coder.getNextRand();
      arr[i] = rnd;
    } // for (i)
    // check not repeated

    for (i = 0; i < NUM_ITERS - 8; i++) {
      const a = arr[i + 0];
      const b = arr[i + 1];
      const c = arr[i + 2];
      const d = arr[i + 3];
      for (let j = i + 5; j < NUM_ITERS - 8; j += 8) {
        const aa = arr[j + 0];
        const bb = arr[j + 1];
        const cc = arr[j + 2];
        const dd = arr[j + 3];
        const isEq = ((a === aa) && (b === bb) && (c === cc) && (d === dd));
        if (isEq) {
          console.log(`repeat is detected! ${a},${b},${c},${d}`);
        }

        expect(isEq).toBeFalsy();
      }
    }
  }); // it

  it('getNextRand check distribution', () => {
    const coder = new Coder();
    const NUM_ITERS = 1024 * 2;
    const NUM_BINS = 16;
    const hist = [];
    let i;
    for (i = 0; i < NUM_BINS; i++) {
      hist.push(0);
    }

    for (i = 0; i < NUM_ITERS; i++) {
      const rnd = coder.getNextRand() & (NUM_BINS - 1);
      hist[rnd]++;
    } // for (i)
    // normalize distrib
    let valMax = 0;
    for (i = 0; i < NUM_BINS; i++) {
      valMax = (hist[i] > valMax) ? hist[i] : valMax;
    }
    const NORM = 64;

    for (i = 0; i < NUM_BINS; i++) {
      const n = Math.floor(hist[i] * NORM / valMax);
      hist[i] = n;
    }
    // print distrib
    for (i = 0; i < NUM_BINS; i++) {
      let str = '';
      for (let j = 0; j < NORM; j++) {
        str = str.concat( (hist[i] >= j) ? '+' : '-' );
      }
      // console.log(`hist[ ${i} ] = ${str}`);
      expect(hist[i] > NORM / 2).toBeTruthy();
    }
  }); // it

  it('crc check', () => {
    const coder = new Coder();
    
    const STR_PASS = 'BeOrNotToBeWh44tIsTheQuestion0f411Times';
    let STR_BASE = 'Hello, this is captain speaking';
    const NUM_ITERS = 96;
    let prevCrc = 2726353;
    for (let i = 0; i < NUM_ITERS; i++) {
      const strMsg = STR_BASE.concat(String.fromCharCode(33 + i));
      const crc = coder.getMessageCrc(STR_PASS, strMsg) & 0x3fffffff;
      const dif = Math.abs(crc - prevCrc);
      expect(dif > 16).toBeTruthy();
      // next
      prevCrc = crc;
    }
  }); // it
  it('encode, decode into bit array', () => {
    const coder = new Coder();
    const STR_PASS = 'ha';
    let SRC_MSG = 'abcd';
    coder.init();
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, SRC_MSG);

    const ARR_SIZE = 512 * 512 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    coder.putToBitArray(arr, ARR_SIZE);

    coder.init();
    coder.setPass(STR_PASS);
    const strDecoded = coder.getFromBitArray(arr, ARR_SIZE);
    // console.log(`decoded from bit arr = ${strDecoded}`);
    expect(strDecoded === SRC_MSG).toBeTruthy();
  }); // it

  it('rus check decode the same using bit array', () => {
    const coder = new Coder();
    const STR_PASS = 'NeSlishniVSaduDaze60';
    let SRC_MSG = 'Привет, как дела. Всего небольшой текст!';
    coder.init();
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, SRC_MSG);

    const ARR_SIZE = 512 * 512 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    coder.putToBitArray(arr, ARR_SIZE);

    coder.init();
    coder.setPass(STR_PASS);
    const strDecoded = coder.getFromBitArray(arr, ARR_SIZE);
    // console.log(`decoded from bit arr = ${strDecoded}`);
    expect(strDecoded === SRC_MSG).toBeTruthy();
  }); // it

  it('check wrong pass for decode', () => {
    const coder = new Coder();
    const STR_PASS_A = 'Hella';
    const STR_PASS_B = 'Hellb';
    const SRC_MSG = 'Nice, nicde, nice';
    coder.init();
    coder.setPass(STR_PASS_A);
    coder.setMessageDecoded(STR_PASS_A, SRC_MSG);

    const ARR_SIZE = 512 * 512 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    coder.putToBitArray(arr, ARR_SIZE);

    coder.init();
    coder.setPass(STR_PASS_B);
    const strDecoded = coder.getFromBitArray(arr, ARR_SIZE);
    // console.log(`decoded from bit arr = ${strDecoded}`);
    expect(strDecoded !== SRC_MSG).toBeTruthy();
    expect(strDecoded === '').toBeTruthy();
  }); // it

  it('encode, decode into pixel array', () => {
    const coder = new Coder();
    const STR_PASS = 'ha';
    let SRC_MSG = 'abcd';
    coder.init();
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, SRC_MSG);

    const ARR_SIZE = 64 * 64 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    coder.putToArray(arr, ARR_SIZE);

    coder.init();
    coder.setPass(STR_PASS);
    const strDecoded = coder.getFromArray(arr, ARR_SIZE);
    // console.log(`decoded from pixel arr = ${strDecoded}`);
    expect(strDecoded === SRC_MSG).toBeTruthy();
  }); // it

  it('rus letters encode, decode into pixel array', () => {
    const coder = new Coder();
    const STR_PASS = 'TopoliniyPuhZaraIyul';
    const SRC_MSG = 'Hello. Привет, это небольшой тест';
    console.log(`enc rus = ${SRC_MSG}`);
    coder.init();
    coder.setPass(STR_PASS);
    coder.setMessageDecoded(STR_PASS, SRC_MSG);

    const ARR_SIZE = 512 * 512 * 4;
    const arr = new Uint8Array(ARR_SIZE);
    coder.putToArray(arr, ARR_SIZE);

    coder.init();
    coder.setPass(STR_PASS);
    const strDecoded = coder.getFromArray(arr, ARR_SIZE);
    console.log(`decoded from pixel arr rus = ${strDecoded}`);
    expect(strDecoded === SRC_MSG).toBeTruthy();
  }); // it
  

}); // describe


