import React, { Component } from "react";
import { Form, Col, Button, ButtonGroup, InputGroup, FormControl } from "react-bootstrap";
import { connect } from "react-redux";

import SelectElement from "./SelectElement";
import * as productsApi from "../api/products";
import * as warehousesActions from "../store/warehouses/actions";
import ProductsMoveList from "./ProductsMoveList";

class ProductsDistributionElement extends Component {
  state = {
    productsSelectPagination: {
      page: 1,
      limit: 10,
      totalCount: 0,
      count: 0,
      loading: false,
      searchString: ""
    },
    showMove: false
  };

  componentDidUpdate(prevProps) {
    if (prevProps.productsDistributions !== this.props.productsDistributions) {
      this.resetOptions();
    }
  }

  onChangeProduct(productOption) {
    this.props.dispatch(warehousesActions.editProductForWarehouse({ productDistributions: this.props.productDistributions, product: productOption.value }));
  }

  onChangeQuantity(quantity) {
    this.props.dispatch(warehousesActions.editProductForWarehouse({ productDistributions: this.props.productDistributions, quantity }));
  }

  async loadOptions(searchString) {
    if (this.state.productsSelectPagination.loading) return;

    this.setState({ productsSelectPagination: { ...this.state.productsSelectPagination, loading: true } });

    if (searchString !== this.state.productsSelectPagination.searchString) {
      this.resetOptions();
    }

    const products = await productsApi.fetchAllProductsList({
      searchString,
      page: this.state.productsSelectPagination.page,
      limit: this.state.productsSelectPagination.limit
    });

    this.setState({
      productsSelectPagination: {
        ...this.state.productsSelectPagination,
        totalCount: products.totalCount,
        count: this.state.productsSelectPagination.count + products.items.length,
        page: this.state.productsSelectPagination.page + 1,
        loading: false,
        searchString
      }
    });

    return {
      options: products.items.map(item => ({ value: item, label: item.title })),
      hasMore: this.state.productsSelectPagination.totalCount !== 0 && this.state.productsSelectPagination.totalCount > this.state.productsSelectPagination.count
    };
  }

  filterOptionsBySelected(options) {
    return options.filter(option => {
      return !this.props.productsDistributions.find(selectedProduct => {
        if (!selectedProduct.product) return false;
        return selectedProduct.product.id === option.value.id;
      });
    });
  }

  reduceSelectOptions(prevOptions, loadedOptions) {
    return [...prevOptions, ...this.filterOptionsBySelected(loadedOptions)];
  }

  resetOptions() {
    this.setState({ productsSelectPagination: { ...this.state.productsSelectPagination, cacheVersion: this.state.productsSelectPagination.cacheVersion + 1, page: 1, totalCount: 0, count: 0 } });
  }

  onClickRemove() {
    this.props.dispatch(warehousesActions.removeProductDistributionsFromMove(this.props.productDistributions));
    this.props.dispatch(warehousesActions.removeProductFromWarehouse(this.props.productDistributions));
  }

  onClickMove() {
    if (this.state.showMove) this.props.dispatch(warehousesActions.removeProductDistributionsFromMove(this.props.productDistributions));

    this.setState({ showMove: !this.state.showMove });
  }

  render() {
    return (
      <>
        <Form.Row className="my-3">
          <Col sm="4">
            <SelectElement
              disabled={this.state.showMove || this.props.onlyMove || !this.props.productDistributions.isNew}
              cacheUniq={this.props.productsDistributions}
              reduceOptions={(prevOptions, loadedOptions) => this.reduceSelectOptions(prevOptions, loadedOptions)}
              loadOptions={searchString => this.loadOptions(searchString)}
              onChange={e => this.onChangeProduct(e)}
              value={
                this.props.productDistributions.product && {
                  label: this.props.productDistributions.product.title,
                  value: this.props.productDistributions.product
                }
              }
            />
          </Col>
          <Col sm="4">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Quantity"
                type="number"
                min={0}
                value={this.props.productDistributions.quantity}
                disabled={this.state.showMove || this.props.onlyMove || !this.props.productDistributions.product}
                onChange={e => this.onChangeQuantity(+e.target.value)}
                aria-describedby="free-quantity"
              />
              {this.props.productDistributions.product && (
                <InputGroup.Append>
                  <InputGroup.Text id="free-quantity">
                    {this.props.productDistributions.product.freeQuantity}
                  </InputGroup.Text>
                </InputGroup.Append>
              )}
            </InputGroup>
          </Col>
          <Col sm="4">
            <ButtonGroup className="w-100">
              {!this.props.onlyMove && (
                <Button variant="danger" onClick={() => this.onClickRemove()}>
                  Remove
                </Button>
              )}
              {this.props.selectedWarehouse && !this.props.productDistributions.isNew && (
                <Button variant="info" onClick={() => this.onClickMove()} active={this.state.showMove}>
                  Move
                </Button>
              )}
            </ButtonGroup>
          </Col>
        </Form.Row>
        {this.state.showMove && <ProductsMoveList productDistributions={this.props.productDistributions} />}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedWarehouse: state.warehouses.selected.item,
    productsDistributions: state.warehouses.selected.products.items
  };
}

export default connect(mapStateToProps)(ProductsDistributionElement);
