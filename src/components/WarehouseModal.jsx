import React, { Component } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { connect } from "react-redux";
import Loader from "./Loader";
import * as warehousesActions from "../store/warehouses/actions";
import ProductsDistributionList from "./ProductsDistributionList";

class WarehouseModal extends Component {
  state = {
    title: "",
    showBeforeRemoveModal: false,
    showMoveBeforeRemoveModal: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.selectedWarehouse !== prevProps.selectedWarehouse) {
      if (this.props.selectedWarehouse) {
        this.setState({ ...this.props.selectedWarehouse });
      } else {
        this.setState({ title: "" });
      }
    }
  }

  async onClickWarehouseSave(event) {
    event.preventDefault();

    if (this.props.selectedWarehouse) {
      await this.props.dispatch(warehousesActions.editWarehouse({ ...this.state }));
    } else {
      await this.props.dispatch(warehousesActions.createWarehouse({ ...this.state }));
    }

    if (!this.props.selectedError) this.onWarehouseClose();
  }

  onWarehouseClose() {
    this.setState({ id: null, title: "", quantity: 0, showBeforeRemoveModal: false, showMoveBeforeRemoveModal: false });
    this.props.dispatch(warehousesActions.clearSelectedWarehouse());
    this.props.onClose();
  }

  featchWarehouseProducts() {
    if (this.props.selectedWarehouse) {
      this.props.dispatch(warehousesActions.fetchProductsBySelectedWarehouses());
    }
  }

  async onClickRemoveWarehouse() {
    await this.props.dispatch(warehousesActions.removeWarehouse());

    if (!this.props.selectedError) this.onWarehouseClose();
  }

  async onClickRemoveWarehouseWithMove() {
    await this.props.dispatch(warehousesActions.editWarehouse({ ...this.state }));
    this.onClickRemoveWarehouse();
  }

  onShowBeforeRemoveModal() {
    this.props.onClose();
    this.setState({ showBeforeRemoveModal: true });
  }

  onShowMoveBeforeRemoveModal() {
    this.setState({ showBeforeRemoveModal: false, showMoveBeforeRemoveModal: true });
  }

  render() {
    return (
      <>
        <Modal show={this.props.show} onHide={() => this.onWarehouseClose()} onShow={() => this.featchWarehouseProducts()}>
          <Form onSubmit={event => this.onClickWarehouseSave(event)}>
            <Modal.Header closeButton>
              <Modal.Title>Warehouse information</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ position: "relative" }}>
              {this.props.selectedLoading && <Loader full />}
              {!!this.props.selectedError && <Alert variant="danger">{this.props.selectedError.message}</Alert>}
              <Form.Group>
                <Form.Label>Warehouse title</Form.Label>
                <Form.Control type="text" placeholder="Enter warehouse title" required value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
              </Form.Group>
              <ProductsDistributionList />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => this.onWarehouseClose()}>
                Close
              </Button>
              {this.state.id && (
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
        <Modal show={this.state.showBeforeRemoveModal} onHide={() => this.onWarehouseClose()}>
          <Modal.Header closeButton>
            <Modal.Title>Question</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ position: "relative" }}>Are you want to remove the warehouse?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.onWarehouseClose()}>
              Close
            </Button>
            {!!this.props.selectedWarehouseProducts.length && (
              <Button variant="primary" onClick={() => this.onShowMoveBeforeRemoveModal()}>
                Move product before remove
              </Button>
            )}
            <Button variant="danger" onClick={() => this.onClickRemoveWarehouse()}>
              Yes, remove
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showMoveBeforeRemoveModal} onHide={() => this.onWarehouseClose()}>
          <Modal.Header closeButton>
            <Modal.Title>Move products for another warehouses</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ position: "relative" }}>
            <ProductsDistributionList onlyMove />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.onWarehouseClose()}>
              Close
            </Button>
            <Button variant="danger" onClick={() => this.onClickRemoveWarehouseWithMove()}>
              Move and remove
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedWarehouseProducts: state.warehouses.selected.products.items,
    selectedWarehouse: state.warehouses.selected.item,
    selectedLoading: state.warehouses.selected.loading,
    selectedError: state.warehouses.selected.error
  };
}

export default connect(mapStateToProps)(WarehouseModal);
