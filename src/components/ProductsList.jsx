import React, { Component } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { connect } from "react-redux";
import * as productsActions from "../store/products/actions";
import * as productsActionTypes from "../store/products/actionTypes";
import ProductModal from "./ProductModal";
import Loader from "./Loader";

class ProductsList extends Component {
  state = {
    showProductModal: false
  };
  scrollContainer = null;

  async componentDidMount() {
    await this.props.dispatch(productsActions.fetchProducts());

    while (this.scrollContainer.scrollHeight <= this.scrollContainer.clientHeight && this.props.listItems.length < this.props.listTotalCount) {
      await this.props.dispatch(productsActions.fetchProducts());
    }
  }

  onClickProduct(product) {
    this.props.dispatch({ type: productsActionTypes.SET_SELECTED_ITEM, product });
    this.setState({ showProductModal: true });
  }

  onClickAddProduct() {
    this.setState({ showProductModal: true });
  }

  onScrollList(element) {
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.props.dispatch(productsActions.fetchProducts());
    }
  }

  render() {
    return (
      <>
        <div style={{ justifyContent: "space-between", display: "flex" }} className="my-3">
          <h4>Products list</h4>
          <Button onClick={() => this.onClickAddProduct()}>Add product</Button>
          <ProductModal onClose={() => this.setState({ showProductModal: false })} show={this.state.showProductModal} />
        </div>
        {!!this.props.listError && <Alert variant="danger">{this.props.listError.message}</Alert>}
        <div style={{ position: "relative" }}>
          <div className="list-container" onScroll={e => this.onScrollList(e.target)} ref={ref => (this.scrollContainer = ref)}>
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Free</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {this.props.listItems.map(product => (
                  <tr key={product.id} onClick={() => this.onClickProduct(product)}>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>{product.freeQuantity}</td>
                    <td>{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {this.props.listLoading && <Loader full />}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedWarehouse: state.warehouses.selected.item,
    selectedItem: state.products.selected.item,
    listItems: state.products.list.items,
    listTotalCount: state.products.list.pagination.totalCount,
    listLoading: state.products.list.loading,
    listError: state.products.list.error
  };
}

export default connect(mapStateToProps)(ProductsList);
