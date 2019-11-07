import React, { Component } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { connect } from "react-redux";
import Loader from "./Loader";
import WarehousesDistributionList from "./WarehousesDistributionList";
import * as productsActions from "../store/products/actions";

class ProductModal extends Component {
  state = {
    showBeforeRemoveModal: false
  };

  async onClickProductSave(event) {
    event.preventDefault();

    await this.props.dispatch(productsActions.saveProduct());

    if (!this.props.selectedError) this.onProductClose();
  }

  onProductClose() {
    this.setState({ id: null, title: "", quantity: 0, showBeforeRemoveModal: false });
    this.props.dispatch(productsActions.clearSelectedProduct());
    this.props.onClose();
  }

  featchProductWarehouses() {
    if (this.props.selectedProduct) {
      this.props.dispatch(productsActions.fetchWarehousesBySelectedProduct());
    }
  }

  async onClickRemoveProduct() {
    await this.props.dispatch(productsActions.removeProduct());

    if (!this.props.selectedError) this.onProductClose();
  }

  onShowBeforeRemoveModal() {
    this.props.onClose();
    this.setState({ showBeforeRemoveModal: true });
  }

  render() {
    return (
      <>
        <Modal show={this.props.show} onHide={() => this.onProductClose()} onShow={() => this.featchProductWarehouses()}>
          <Form onSubmit={event => this.onClickProductSave(event)}>
            <Modal.Header closeButton>
              <Modal.Title>Product information</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ position: "relative" }}>
              {this.props.selectedLoading && <Loader full />}
              {!!this.props.selectedError && <Alert variant="danger">{this.props.selectedError.message}</Alert>}

              <Form.Group>
                <Form.Label>Product title</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Enter product title"
                  value={this.props.selectedProduct.title || ""}
                  onChange={e => this.props.dispatch(productsActions.editProduct({ title: e.target.value }))}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Product quantity</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={0}
                  placeholder="Enter product quantity"
                  value={this.props.selectedProduct.quantity || 0}
                  onChange={e => this.props.dispatch(productsActions.editProduct({ quantity: +e.target.value }))}
                />
              </Form.Group>

              <WarehousesDistributionList
                quantity={this.state.quantity}
                onChange={(warehousesDistributions, warehousesDistributionsToDelete) => this.setState({ warehousesDistributions, warehousesDistributionsToDelete })}
                onChangeQuantitySum={quantitySum => this.setState({ minQuantity: quantitySum })}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => this.onProductClose()}>
                Close
              </Button>
              {this.props.selectedProduct.id && (
                <Button variant="danger" onClick={() => this.onShowBeforeRemoveModal()}>
                  Remove
                </Button>
              )}
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Modal show={this.state.showBeforeRemoveModal} onHide={() => this.onProductClose()}>
          <Modal.Header closeButton>
            <Modal.Title>Question</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ position: "relative" }}>Are you want to remove the product? It will be removed from all warehouses.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.onProductClose()}>
              Close
            </Button>
            <Button variant="danger" onClick={() => this.onClickRemoveProduct()}>
              Yes, remove
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedProduct: state.products.selected.item,
    selectedProductWarehouses: state.products.selected.warehouses.items,
    selectedLoading: state.products.selected.loading,
    selectedError: state.products.selected.error
  };
}

export default connect(mapStateToProps)(ProductModal);
