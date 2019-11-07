import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";
import ProductsMoveElement from "./ProductsMoveElement";
import * as warehousesActions from "../store/warehouses/actions";
import * as warehousesSelectors from "../store/warehouses/reducer";

class ProductsMoveList extends Component {
  onClickAddProductsMove() {
    this.props.dispatch(warehousesActions.addProductForMove(this.props.productDistributions));
  }

  render() {
    return (
      <>
        <div style={{ position: "relative" }}>
          {this.props.warehousesDistributions.map(item => (
            <ProductsMoveElement key={item.id} productForMoveItem={item} warehousesDistributions={this.props.warehousesDistributions} />
          ))}
        </div>
        {!this.props.productDistributions.quantity <= 0 && (
          <Button block onClick={() => this.onClickAddProductsMove()}>
            Add new move
          </Button>
        )}
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    warehousesDistributions: warehousesSelectors.getWarehousesDistributionsByProductDistributions(state, ownProps.productDistributions),
    productsForMove: state.warehouses.selected.productsForMove
  };
}

export default connect(mapStateToProps)(ProductsMoveList);
