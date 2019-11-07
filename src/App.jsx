import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Provider } from "react-redux";

import WarehousesList from "./components/WarehousesList";
import ProductsList from "./components/ProductsList";
import store from "./store";

import "bootstrap/dist/css/bootstrap.min.css";

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Container>
          <Row>
            <Col className="full-height" xs="12" md="6">
              <WarehousesList />
            </Col>
            <Col className="full-height" xs="12" md="6">
              <ProductsList />
            </Col>
          </Row>
        </Container>
      </Provider>
    );
  }
}
