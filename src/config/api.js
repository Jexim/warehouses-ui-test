const devConfig = {
  url: "http://localhost:4000"
};

const prodConfig = {
  url: "https://warehouses-mock-api-test.herokuapp.com/"
};

export default process.env.NODE_ENV || process.env.NODE_ENV === "development" ? devConfig : prodConfig;
