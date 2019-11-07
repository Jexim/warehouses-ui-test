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

  async componentDidMount() {
    this.feachMoreProducts();
  }

  feachMoreProducts() {
    if (!this.props.listLoading) this.props.dispatch(productsActions.fetchProducts());
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
      this.feachMoreProducts();
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
          <div style={{ height: "calc(100vh - 96px)", overflow: "auto" }} onScroll={e => this.onScrollList(e.target)}>
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
    listLoading: state.products.list.loading,
    listError: state.products.list.error
  };
}

export default connect(mapStateToProps)(ProductsList);
