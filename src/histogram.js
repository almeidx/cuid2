const { describe } = require("riteway");
const { createId } = require("./index.js");
const { createIdPool, info } = require("./test-utils.js");

describe("Histogram", async (assert) => {
  const n = 100000;
  info(`Testing ${n} unique IDs...`);
  const pool = await createIdPool({ max: n });
  const ids = pool.ids;
  const sampleIds = ids.slice(0, 10);
  const set = new Set(ids);

  assert({
    given: "lots of ids generated",
    should: "generate no collissions",
    actual: set.size,
    expected: n,
  });

  {
    const tolerance = 0.1;
    const idLength = 23;
    const totalLetters = idLength * n;
    const base = 36;
    const charFrequencies = {};
    // Drop the first character because it will always be a letter, making
    // the letter frequency skewed.
    const testIds = ids.map((id) => id.slice(2));
    const frequencies = ids.reduce((acc, id) => {
      id.split("").forEach(
        (char) => (charFrequencies[char] = (charFrequencies[char] || 0) + 1)
      );
    });
    const expectedBinSize = Math.ceil(totalLetters / base);
    const minBinSize = Math.round(expectedBinSize * (1 - tolerance));
    const maxBinSize = Math.round(expectedBinSize * (1 + tolerance));
    info("Testing character frequency...");
    info(`expectedBinSize: ${expectedBinSize}`);
    info(`minBinSize: ${minBinSize}`);
    info(`maxBinSize: ${maxBinSize}`);
    info(`charFrequencies: ${JSON.stringify(charFrequencies)}`);

    assert({
      given: "lots of ids generated",
      should: "produce even character frequency",
      actual: Object.values(charFrequencies).every(
        (x) => x > minBinSize && x < maxBinSize
      ),
      expected: true,
    });
  }

  {
    const histogram = pool.histogram;
    info(`sample ids: ${sampleIds}`);
    info(`histogram: ${histogram}`);
    const expectedBinSize = Math.ceil(n / histogram.length);
    const tolerance = 0.05;
    const minBinSize = Math.round(expectedBinSize * (1 - tolerance));
    const maxBinSize = Math.round(expectedBinSize * (1 + tolerance));
    info(`expectedBinSize: ${expectedBinSize}`);
    info(`minBinSize: ${minBinSize}`);
    info(`maxBinSize: ${maxBinSize}`);

    assert({
      given: "lots of ids generated",
      should: "produce a histogram within distribution tolerance",
      actual: histogram.every((x) => x > minBinSize && x < maxBinSize),
      expected: true,
    });
  }
});
