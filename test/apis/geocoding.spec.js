const axios = require(`axios`);
const MockAdapter = require(`axios-mock-adapter`); // for mocking axios
const { assert } = require(`chai`);

const geocodingAPI = require(`../../apis/geocoding`);

let mock; // declare variable for scoping

describe(`Geocoding API`, () => {
  before(() => {
    mock = new MockAdapter(axios); // mock our axios for testing
  });

  beforeEach(() => {
    mock.reset(); // cleanup any mock handlers before the next test
  });

  afterEach(() => {
    mock.reset(); // cleanup any mock handlers before the next test
  });

  after(() => {
    mock.restore(); // restore axios after this test block is done
  });

  it(`should return an object with a name property that includes the query on positive match`, async () => {
    const query = `Prague`;
    mock // defined behavior when axios is given this specific url and parameters
      .onGet(`https://nominatim.openstreetmap.org/search`, { params: { q: query, format: `json` } })
      .reply(200, [{ display_name: `Prague, okres Hlavní město Praha, Hlavní město Praha, Prague, Czech Republic` }]);

    const object = await geocodingAPI(query);
    const name = object.display_name;
    assert.isTrue(name.includes(query));
  });

  it(`should return a longitude and latitude pair of properties on positive match`, async () => {
    const query = `Prague`;
    const lat = 50.0874654;
    const lon = 14.4212535;
    mock
      .onGet(`https://nominatim.openstreetmap.org/search`, { params: { q: query, format: `json` } })
      .reply(200, [
        { display_name: `Prague, okres Hlavní město Praha, Hlavní město Praha, Prague, Czech Republic`, lat, lon },
      ]);

    const object = await geocodingAPI(query);
    const latitude = object.lat;
    const longitude = object.lon;
    assert.strictEqual(latitude, lat);
    assert.strictEqual(longitude, lon);
  });

  it(`should return an empty object when no match is found`, async () => {
    const query = `someunknownlocation`;
    mock.onGet(`https://nominatim.openstreetmap.org/search`, { params: { q: query, format: `json` } }).reply(200, []);

    const object = await geocodingAPI(query);
    assert.deepEqual(object, {});
  });

  it(`should return null when API endpoint has some non-200 status`, async () => {
    const query = `Prague`;
    mock.onGet(`https://nominatim.openstreetmap.org/search`, { params: { q: query, format: `json` } }).reply(500, []);

    const object = await geocodingAPI(query);
    assert.strictEqual(object, null);
  });
});
