import uuid from "uuid/v4";
import * as types from "./actionTypes";
import * as warehousesApi from "../../api/warehouses";
import * as productsApi from "../../api/products";
import * as productsActions from "../products/actions";

export function fetchWarehouses() {
  return async (dispatch, getState) => {
    try {
      if (getState().warehouses.list.pagination.loading || (getState().warehouses.list.pagination.totalCount !== 0 && getState().warehouses.list.pagination.totalCount <= getState().warehouses.list.items.length)) return;

      dispatch({ type: types.SET_LIST_ERROR, error: null });
      dispatch({ type: types.SET_LIST_LOADING, loading: true });

      const warehouses = await warehousesApi.fetchWarehousesList({
        page: getState().warehouses.list.pagination.page,
        limit: getState().warehouses.list.pagination.limit
      });

      dispatch({ type: types.SET_LIST_ITEMS, items: [...getState().warehouses.list.items, ...warehouses.items] });
      dispatch({ type: types.SET_LIST_PAGE, page: getState().warehouses.list.pagination.page + 1 });
      dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: warehouses.totalCount });
      dispatch({ type: types.SET_LIST_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_LIST_ERROR, error });
      dispatch({ type: types.SET_LIST_LOADING, loading: false });
    }
  };
}

export function fetchProductsBySelectedWarehouses() {
  return async (dispatch, getState) => {
    try {
      const state = getState();

      dispatch({ type: types.SET_SELECTED_PRODUCTS_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_PRODUCTS_LOADING, loading: true });

      const products = await productsApi.fetchProductsListByWarehouse({ warehouseId: state.warehouses.selected.item.id });

      dispatch({ type: types.SET_SELECTED_PRODUCTS_ITEMS, items: [...state.warehouses.selected.products.items, ...products] });
      dispatch({ type: types.SET_SELECTED_PRODUCTS_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_PRODUCTS_ERROR, error });
      dispatch({ type: types.SET_SELECTED_PRODUCTS_LOADING, loading: false });
    }
  };
}

export function clearSelectedWarehouse() {
  return (dispatch, getState) => {
    dispatch({ type: types.SET_SELECTED_ITEM, warehouse: null });
    dispatch({ type: types.SET_SELECTED_ERROR, error: null });
    dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    dispatch({ type: types.SET_SELECTED_PRODUCTS_ITEMS, items: [] });
    dispatch({ type: types.SET_SELECTED_PRODUCTS_ERROR, error: null });
    dispatch({ type: types.SET_SELECTED_PRODUCTS_LOADING, loading: false });
    dispatch({ type: types.SET_SELECTED_PRODUCTS_FOR_MOVE, productsForMove: [] });
    dispatch({ type: types.SET_SELECTED_PRODUCTS_FOR_DELETE, productsForDelete: [] });
  };
}

export function createWarehouse({ title }) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_SELECTED_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: true });

      const productsDistributions = getState().warehouses.selected.products.items;

      if (productsDistributions.findIndex(productItem => !productItem.product) !== -1) throw new Error("Not all products are selected, check the fields");

      const newWarehouse = await warehousesApi.createWarehouse({ title, productsDistributions });

      if (getState().warehouses.list.pagination.totalCount === getState().warehouses.list.items.length) {
        dispatch({ type: types.SET_LIST_ITEMS, items: [...getState().warehouses.list.items, newWarehouse] });
      }

      await dispatch(updateProducts({ productsDistributions }));

      dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: getState().warehouses.list.pagination.totalCount + 1 });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_ERROR, error });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    }
  };
}

export function editWarehouse({ title }, withoutUpdateWarehouses) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_SELECTED_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: true });

      if (getState().warehouses.selected.products.items.findIndex(productItem => !productItem.product) !== -1) throw new Error("Not all products are selected, check the fields");

      if (getState().warehouses.selected.productsForMove.findIndex(productForMove => productForMove.warehousesDistributions.findIndex(warehouseDistributions => !warehouseDistributions.warehouse) !== -1) !== -1)
        throw new Error("Not all warehouses are selected, check the fields");

      const id = getState().warehouses.selected.item.id;
      const items = getState().warehouses.list.items;
      const productsDistributions = getState().warehouses.selected.products.items;
      const productsForDelete = getState().warehouses.selected.productsForDelete;
      const productsForMove = getState().warehouses.selected.productsForMove;
      const editWarehouseIndexInArray = items.findIndex(item => item.id === id);
      const warehouse = await warehousesApi.editWarehouse({
        id,
        title,
        productsDistributions,
        productsForDelete,
        productsForMove
      });

      items[editWarehouseIndexInArray] = warehouse;

      if (!withoutUpdateWarehouses) {
        await dispatch(updateProducts({ productsDistributions, productsForDelete }));
        await dispatch(updateWarehousesByMove({ productsForMove }));
      }

      dispatch({ type: types.SET_LIST_ITEMS, items: [...items] });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_ERROR, error });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    }
  };
}

export function removeWarehouse() {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_SELECTED_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: true });

      await warehousesApi.removeWarehouse(getState().warehouses.selected.item);

      const productsDistributions = getState().warehouses.selected.products.items;
      const productsForDelete = getState().warehouses.selected.productsForDelete;

      await dispatch(updateProducts({ productsDistributions, productsForDelete }));

      dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: getState().warehouses.list.pagination.totalCount - 1 });
      dispatch({ type: types.SET_LIST_ITEMS, items: [...getState().warehouses.list.items.filter(item => item.id !== getState().warehouses.selected.item.id)] });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_ERROR, error });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    }
  };
}

export function reloadWarehouse(warehouse) {
  return async (dispatch, getState) => {
    dispatch({ type: types.SET_SELECTED_ITEM, warehouse });
    await dispatch(fetchProductsBySelectedWarehouses());
    await dispatch(editWarehouse({ title: warehouse.title }, true));
    dispatch(clearSelectedWarehouse());
  };
}

export function addProductForMove(productDistributions) {
  return async (dispatch, getState) => {
    const productsForMove = getState().warehouses.selected.productsForMove;
    const indexOfProductDistributions = productsForMove.findIndex(productForMove => productForMove.productDistributions === productDistributions);
    const newWarehouseDistributions = {
      id: uuid(),
      warehouse: null,
      quantity: 0,
      productDistributions
    };

    if (indexOfProductDistributions === -1) {
      productsForMove.push({
        id: uuid(),
        productDistributions,
        warehousesDistributions: [newWarehouseDistributions]
      });
    } else {
      if (Array.isArray(productsForMove[indexOfProductDistributions].warehousesDistributions)) {
        productsForMove[indexOfProductDistributions].warehousesDistributions = [...productsForMove[indexOfProductDistributions].warehousesDistributions, newWarehouseDistributions];
      } else {
        productsForMove[indexOfProductDistributions].warehousesDistributions = [newWarehouseDistributions];
      }
    }

    productDistributions.quantity -= newWarehouseDistributions.quantity;
    productDistributions["edited"] = true;

    dispatch(calcProductForMoveQuantity(newWarehouseDistributions));
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_FOR_MOVE,
      productsForMove: [...productsForMove]
    });
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...getState().warehouses.selected.products.items]
    });
  };
}

export function editProductForMove({ warehouseDistributions, warehouse, quantity }) {
  return async (dispatch, getState) => {
    const productsForMove = getState().warehouses.selected.productsForMove;
    const indexOfProductDistributions = productsForMove.findIndex(productForMove => productForMove.productDistributions === warehouseDistributions.productDistributions);

    if (warehouse) warehouseDistributions.warehouse = warehouse;
    if (quantity >= 0) {
      if (warehouseDistributions.productDistributions.quantity + warehouseDistributions.quantity - quantity >= 0) {
        warehouseDistributions.productDistributions.quantity -= quantity - warehouseDistributions.quantity;
        warehouseDistributions.quantity = quantity;
      }

      warehouseDistributions.productDistributions["moveQuantity"] = productsForMove[indexOfProductDistributions].warehousesDistributions.reduce((sum, productForMove) => sum + productForMove.quantity, 0);
    }

    productsForMove[indexOfProductDistributions].warehousesDistributions = [...productsForMove[indexOfProductDistributions].warehousesDistributions];

    dispatch({
      type: types.SET_SELECTED_PRODUCTS_FOR_MOVE,
      productsForMove: [...getState().warehouses.selected.productsForMove]
    });
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...getState().warehouses.selected.products.items]
    });
  };
}

export function removeProductFromMove(warehouseDistributions) {
  return async (dispatch, getState) => {
    const productsForMove = getState().warehouses.selected.productsForMove;
    const indexOfProductDistributions = productsForMove.findIndex(productForMove => productForMove.productDistributions === warehouseDistributions.productDistributions);

    if (indexOfProductDistributions === -1) return console.warn("No found productDistributions for remove");

    const indexOfWarehousesDistributions = productsForMove[indexOfProductDistributions].warehousesDistributions.indexOf(warehouseDistributions);

    if (indexOfWarehousesDistributions === -1) return console.warn("No found warehousesDistributions for remove");

    productsForMove[indexOfProductDistributions].warehousesDistributions.splice(indexOfWarehousesDistributions, 1);
    productsForMove[indexOfProductDistributions].warehousesDistributions = [...productsForMove[indexOfProductDistributions].warehousesDistributions];
    warehouseDistributions.productDistributions.quantity += warehouseDistributions.quantity;

    dispatch(calcProductForMoveQuantity(warehouseDistributions));
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_FOR_MOVE,
      productsForMove: [...productsForMove]
    });
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...getState().warehouses.selected.products.items]
    });
  };
}

export function calcProductForMoveQuantity(warehouseDistributions) {
  return async (dispatch, getState) => {
    const productsForMove = getState().warehouses.selected.productsForMove;
    const indexOfProductDistributions = productsForMove.findIndex(productForMove => productForMove.productDistributions === warehouseDistributions.productDistributions);

    warehouseDistributions.productDistributions["moveQuantity"] = productsForMove[indexOfProductDistributions].warehousesDistributions.reduce((sum, productForMove) => sum + productForMove.quantity, 0);
    productsForMove[indexOfProductDistributions].warehousesDistributions = [...productsForMove[indexOfProductDistributions].warehousesDistributions];

    dispatch({
      type: types.SET_SELECTED_PRODUCTS_FOR_MOVE,
      productsForMove: [...getState().warehouses.selected.productsForMove]
    });
  };
}

export function removeProductDistributionsFromMove(productDistributions) {
  return async (dispatch, getState) => {
    const productsForMove = getState().warehouses.selected.productsForMove;
    const indexOfProductDistributions = productsForMove.findIndex(productForMove => productForMove.productDistributions === productDistributions);

    productDistributions["moveQuantity"] = 0;

    if (indexOfProductDistributions !== -1) {
      productDistributions.quantity += getState().warehouses.selected.productsForMove[indexOfProductDistributions].warehousesDistributions.reduce(
        (sum, warehouseDistributions) => sum + warehouseDistributions.quantity,
        0
      );
      productsForMove.splice(indexOfProductDistributions, 1);
    }

    dispatch({
      type: types.SET_SELECTED_PRODUCTS_FOR_MOVE,
      productsForMove: [...productsForMove]
    });
  };
}

export function addProductForWarehouse() {
  return async (dispatch, getState) => {
    const warehouseProducts = getState().warehouses.selected.products.items;

    warehouseProducts.push({
      id: uuid(),
      product: null,
      quantity: 0,
      isNew: true
    });

    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...warehouseProducts]
    });
  };
}

export function editProductForWarehouse({ productDistributions, product, quantity }) {
  return async (dispatch, getState) => {
    if (product) {
      if (!productDistributions["firstProduct"]) productDistributions["firstProduct"] = productDistributions.product;

      productDistributions.product = product;
    }
    if (quantity >= 0 && productDistributions.product.freeQuantity + productDistributions.quantity - quantity >= 0) {
      productDistributions.product.freeQuantity -= quantity - productDistributions.quantity;
      productDistributions.quantity = quantity;
    }

    productDistributions["edited"] = true;

    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...getState().warehouses.selected.products.items]
    });
  };
}

export function removeProductFromWarehouse(productDistributions) {
  return async (dispatch, getState) => {
    const warehouseProducts = getState().warehouses.selected.products.items;
    const indexOfProductDistributions = warehouseProducts.indexOf(productDistributions);

    if (indexOfProductDistributions === -1) return console.warn("No found productDistributions for remove");

    warehouseProducts.splice(indexOfProductDistributions, 1);

    dispatch(addProductForDelete(productDistributions));
    dispatch({
      type: types.SET_SELECTED_PRODUCTS_ITEMS,
      items: [...warehouseProducts]
    });
  };
}

export function addProductForDelete(productDistributions) {
  return async (dispatch, getState) => {
    if (!productDistributions.isNew) {
      const productsForDelete = getState().warehouses.selected.productsForDelete;

      productsForDelete.push(productDistributions);

      dispatch({
        type: types.SET_SELECTED_PRODUCTS_FOR_DELETE,
        productsForDelete: [...productsForDelete]
      });
    }
  };
}

export function updateProducts({ productsDistributions, productsForDelete = [] }) {
  return async dispatch => {
    for (let productDistributions of productsDistributions) {
      if (productDistributions.edited) {
        await dispatch(productsActions.reloadProuduct(productDistributions.product));

        if (productDistributions.firstProduct) await dispatch(productsActions.reloadProuduct(productDistributions.firstProduct));
      }
    }

    for (let productDistributions of productsForDelete) {
      await dispatch(productsActions.reloadProuduct(productDistributions.product));
    }
  };
}

export function updateWarehousesByMove({ productsForMove }) {
  return async (dispatch, getState) => {
    const items = getState().warehouses.list.items;

    for (const productForMove of productsForMove) {
      for (const warehouseDistributions of productForMove.warehousesDistributions) {
        const indexOfEditedWarehouse = items.findIndex(warehouseItem => warehouseItem.id === warehouseDistributions.warehouse.id);

        if (indexOfEditedWarehouse !== -1) {
          items[indexOfEditedWarehouse].productsQuantity += warehouseDistributions.quantity;
        }
      }
    }

    dispatch({ type: types.SET_LIST_ITEMS, items: [...items] });
  };
}
