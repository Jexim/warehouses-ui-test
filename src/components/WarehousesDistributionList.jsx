import React, { Component } from "react";
import { Button, Alert } from "react-bootstrap";
import { connect } from "react-redux";

import WarehousesDistributionElement from "./WarehousesDistributionElement";
import * as productsActions from "../store/products/actions";
import Loader from "./Loader";

class WarehousesDistributionList extends Component {
  onClickAddWarehousesDistribution() {
    this.props.dispatch(productsActions.addWarehouseForProduct());
  }

  render() {
    return (
      <>
        {(!!this.props.selectedProduct.freeQuantity || !!this.props.selectedProductWarehouses.length) && (
          <>
            <h4>List of owned warehouses</h4>
            {!!this.props.selectedProductError && <Alert variant="danger">{this.props.selectedProductError.message}</Alert>}
            <div style={{ position: "relative" }}>
              {this.props.selectedProductWarehouses.map(item => (
                <WarehousesDistributionElement key={item.id} warehouseDistributions={item} />
              ))}
              {this.props.selectedProductLoading && <Loader />}
            </div>
            {this.props.selectedProduct && <div className="mb-3">Free count: {this.props.selectedProduct.freeQuantity}</div>}
            {!this.props.selectedProductLoading && (
              <Button block onClick={() => this.onClickAddWarehousesDistribution()}>
                Add to warehouse
              </Button>
            )}
          </>
        )}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedProduct: state.products.selected.item,
    selectedProductWarehouses: state.products.selected.warehouses.items,
    selectedProductLoading: state.products.selected.warehouses.loading,
    selectedProductError: state.products.selected.warehouses.error
  };
}

export default connect(mapStateToProps)(WarehousesDistributionList);
