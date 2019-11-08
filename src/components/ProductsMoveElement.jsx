import React, { Component } from "react";
import { Form, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";

import SelectElement from "./SelectElement";
import * as warehousesActions from "../store/warehouses/actions";
import * as warehousesApi from "../api/warehouses";

class ProductsMoveElement extends Component {
  state = {
    warehousesSelectPagination: {
      page: 1,
      limit: 10,
      totalCount: 0,
      count: 0,
      loading: false,
      searchString: ""
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.warehousesDistributions !== this.props.warehousesDistributions) {
      this.resetOptions();
    }
  }

  onChangeWarehouse(warehouseOption) {
    this.props.dispatch(warehousesActions.editProductForMove({ warehouseDistributions: this.props.productForMoveItem, warehouse: warehouseOption.value }));
  }

  onChangeQuantity(quantity) {
    this.props.dispatch(warehousesActions.editProductForMove({ warehouseDistributions: this.props.productForMoveItem, quantity }));
  }

  onClickRemove() {
    this.props.dispatch(warehousesActions.removeProductFromMove(this.props.productForMoveItem));
  }

  async loadOptions(searchString) {
    if (this.state.warehousesSelectPagination.loading) return;

    this.setState({ warehousesSelectPagination: { ...this.state.warehousesSelectPagination, loading: true } });

    if (searchString !== this.state.warehousesSelectPagination.searchString) {
      this.resetOptions();
    }

    const warehouses = await warehousesApi.fetchWarehousesList({
      searchString,
      page: this.state.warehousesSelectPagination.page,
      limit: this.state.warehousesSelectPagination.limit
    });

    this.setState({
      warehousesSelectPagination: {
        ...this.state.warehousesSelectPagination,
        totalCount: warehouses.totalCount,
        count: this.state.warehousesSelectPagination.count + warehouses.items.length,
        page: this.state.warehousesSelectPagination.page + 1,
        loading: false,
        searchString
      }
    });

    return {
      options: warehouses.items.map(item => ({ value: item, label: item.title })),
      hasMore: this.state.warehousesSelectPagination.totalCount !== 0 && this.state.warehousesSelectPagination.totalCount > this.state.warehousesSelectPagination.count
    };
  }

  filterOptionsBySelected(options) {
    return options.filter(option => {
      if (this.props.selectedWarehouse.id === option.value.id) return false;

      return !this.props.warehousesDistributions.find(warehouseDistributions => {
        if (!warehouseDistributions.warehouse) return false;

        return warehouseDistributions.warehouse.id === option.value.id;
      });
    });
  }

  reduceOptions(prevOptions, loadedOptions) {
    return [...prevOptions, ...this.filterOptionsBySelected(loadedOptions)];
  }

  resetOptions() {
    this.setState({ warehousesSelectPagination: { ...this.state.warehousesSelectPagination, page: 1, totalCount: 0, count: 0 } });
  }

  render() {
    return (
      <Form.Row className="py-3 mb-3" style={{ backgroundColor: "#ddd", borderRadius: 3 }}>
        <Col sm="4">
          <SelectElement
            cacheUniq={this.props.warehousesDistributions}
            reduceOptions={(prevOptions, loadedOptions) => this.reduceOptions(prevOptions, loadedOptions)}
            loadOptions={searchString => this.loadOptions(searchString)}
            onChange={e => this.onChangeWarehouse(e)}
          />
        </Col>
        <Col sm="4">
          <Form.Control
            required
            placeholder="Quantity"
            type="number"
            min={0}
            value={this.props.productForMoveItem.quantity}
            disabled={!this.props.productForMoveItem.warehouse}
            onChange={e => this.onChangeQuantity(+e.target.value)}
          />
        </Col>
        <Col sm="4">
          <Button block variant="danger" onClick={() => this.onClickRemove()} className="w-100">
            Remove
          </Button>
        </Col>
      </Form.Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedWarehouse: state.warehouses.selected.item
  };
}

export default connect(mapStateToProps)(ProductsMoveElement);
