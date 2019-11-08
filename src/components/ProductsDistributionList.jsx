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
        {!!this.props.selectedWarehouseProductsError && <Alert variant="danger">{this.props.selectedWarehouseProductsError.message}</Alert>}
        <div>
          {this.props.selectedWarehouseProducts.map(item => (
            <ProductsDistributionElement key={item.id} productDistributions={item} onlyMove={this.props.onlyMove} />
          ))}
          {this.props.selectedWarehouseProductsLoading && <Loader />}
        </div>
        {!this.props.selectedWarehouseProductsLoading && !this.props.onlyMove && (
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
    selectedWarehouseProductsLoading: state.warehouses.selected.products.loading,
    selectedWarehouseProductsError: state.warehouses.selected.products.error
  };
}

export default connect(mapStateToProps)(ProductsDistributionList);
