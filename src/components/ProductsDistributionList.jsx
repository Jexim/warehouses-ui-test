import React, { Component } from "react";
import { Button, Alert } from "react-bootstrap";
import { connect } from "react-redux";

import ProductsDistributionElement from "./ProductsDistributionElement";
import * as warehousesActions from "../store/warehouses/actions";
import Loader from "./Loader";

class ProductsDistributionList extends Component {
  onClickAddProductDistribution() {
    this.props.dispatch(warehousesActions.addProductForWarehouse());
  }

  render() {
    return (
      <>
        <h4>List of owned products</h4>
        {!!this.props.selectedWarehouseError && <Alert variant="danger">{this.props.selectedWarehouseError.message}</Alert>}
        <div>
          {this.props.selectedWarehouseProducts.map(item => (
            <ProductsDistributionElement key={item.id} productDistributions={item} onlyMove={this.props.onlyMove} />
          ))}
          {this.props.selectedWarehouseLoading && <Loader />}
        </div>
        {!this.props.selectedWarehouseLoading && !this.props.onlyMove && (
          <Button block className="mt-3" onClick={() => this.onClickAddProductDistribution()}>
            Add product
          </Button>
        )}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedWarehouseProducts: state.warehouses.selected.products.items,
    selectedWarehouseLoading: state.warehouses.selected.products.loading,
    selectedWarehouseError: state.warehouses.selected.products.error
  };
}

export default connect(mapStateToProps)(ProductsDistributionList);
