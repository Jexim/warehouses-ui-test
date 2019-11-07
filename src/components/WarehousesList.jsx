import React, { Component } from "react";
import { connect } from "react-redux";
import { Alert, Button, Table } from "react-bootstrap";
import * as wrehousesAction from "../store/warehouses/actions";
import * as wrehousesActionTypes from "../store/warehouses/actionTypes";
import Loader from "./Loader";
import WarehouseModal from "./WarehouseModal";

class WarehousesList extends Component {
  state = {
    showWarehouseModal: false
  };

  componentDidMount() {
    this.feachMoreWarehouses();
  }

  feachMoreWarehouses() {
    this.props.dispatch(wrehousesAction.fetchWarehouses());
  }

  onClickWarehouse(warehouse) {
    this.props.dispatch({ type: wrehousesActionTypes.SET_SELECTED_ITEM, warehouse });
    this.setState({ showWarehouseModal: true });
  }

  onScrollList(element) {
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.feachMoreWarehouses();
    }
  }

  render() {
    return (
      <div>
        <div style={{ justifyContent: "space-between", display: "flex" }} className="my-3">
          <h4>Warehouses list</h4>
          <Button onClick={() => this.setState({ showWarehouseModal: true })}>Add warehouse</Button>
          <WarehouseModal onClose={() => this.setState({ showWarehouseModal: false })} show={this.state.showWarehouseModal} />
        </div>
        {!!this.props.listError && <Alert variant="danger">{this.props.listError.message}</Alert>}
        <div style={{ position: "relative" }}>
          <div style={{ height: "calc(100vh - 98px)", overflow: "auto" }} onScroll={e => this.onScrollList(e.target)}>
          <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Products quantity</th>
                </tr>
              </thead>
              <tbody>
                {this.props.listItems.map(warehouse => (
                  <tr key={warehouse.id} onClick={() => this.onClickWarehouse(warehouse)}>
                    <td>{warehouse.id}</td>
                    <td>{warehouse.title}</td>
                    <td>{warehouse.productsQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {this.props.listLoading && <Loader full />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedItem: state.warehouses.selected.item,
    listItems: state.warehouses.list.items,
    listLoading: state.warehouses.list.loading,
    listError: state.warehouses.list.error
  };
}

export default connect(mapStateToProps)(WarehousesList);
