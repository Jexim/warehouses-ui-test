import React, { Component } from "react";
import { Form, Col, Button, ButtonGroup } from "react-bootstrap";
import { connect } from "react-redux";

import SelectElement from "./SelectElement";
import * as warehousesApi from "../api/warehouses";
import * as productsActions from "../store/products/actions";

class WarehousesDistributionElement extends Component {
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
    this.props.dispatch(productsActions.editWarehouseForProduct({ warehouseDistributions: this.props.warehouseDistributions, warehouse: warehouseOption.value }));
  }

  onChangeQuantity(quantity) {
    this.props.dispatch(productsActions.editWarehouseForProduct({ warehouseDistributions: this.props.warehouseDistributions, quantity }));
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
      return !this.props.warehousesDistributions.find(selectedWarehouse => {
        if (!selectedWarehouse.warehouse) return false;
        return selectedWarehouse.warehouse.id === option.value.id;
      });
    });
  }

  reduceSelectOptions(prevOptions, loadedOptions) {
    return [...prevOptions, ...this.filterOptionsBySelected(loadedOptions)];
  }

  resetOptions() {
    this.setState({ warehousesSelectPagination: { ...this.state.warehousesSelectPagination, page: 1, totalCount: 0, count: 0 } });
  }

  onClickRemove() {
    this.props.dispatch(productsActions.removeWarehouseFromProduct(this.props.warehouseDistributions));
  }

  render() {
    return (
      <>
        <Form.Row className="my-3">
          <Col sm="4">
            <SelectElement
              cacheUniq={this.props.warehousesDistributions}
              reduceOptions={(prevOptions, loadedOptions) => this.reduceSelectOptions(prevOptions, loadedOptions)}
              loadOptions={searchString => this.loadOptions(searchString)}
              onChange={e => this.onChangeWarehouse(e)}
              value={
                this.props.warehouseDistributions.warehouse && {
                  label: this.props.warehouseDistributions.warehouse.title,
                  value: this.props.warehouseDistributions.warehouse
                }
              }
            />
          </Col>
          <Col sm="4">
            <Form.Control
              required
              placeholder="Quantity"
              type="number"
              min={0}
              disabled={!this.props.warehouseDistributions.warehouse}
              value={this.props.warehouseDistributions.quantity}
              onChange={e => this.onChangeQuantity(+e.target.value)}
            />
          </Col>
          <Col sm="4">
            <ButtonGroup className="w-100">
              <Button variant="danger" onClick={() => this.onClickRemove()}>
                Remove
              </Button>
            </ButtonGroup>
          </Col>
        </Form.Row>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    warehousesDistributions: state.products.selected.warehouses.items
  };
}

export default connect(mapStateToProps)(WarehousesDistributionElement);
