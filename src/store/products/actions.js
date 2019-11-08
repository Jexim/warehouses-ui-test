import uuid from "uuid/v4";
import * as types from "./actionTypes";
import * as productsApi from "../../api/products";
import * as warehousesApi from "../../api/warehouses";
import * as warehousesActions from "../warehouses/actions";

export function fetchProducts() {
  return async (dispatch, getState) => {
    try {
      if (getState().products.list.pagination.loading || (getState().products.list.pagination.totalCount !== 0 && getState().products.list.pagination.totalCount <= getState().products.list.items.length)) return;

      dispatch({ type: types.SET_LIST_ERROR, error: null });
      dispatch({ type: types.SET_LIST_LOADING, loading: true });

      const products = await productsApi.fetchAllProductsList({
        page: getState().products.list.pagination.page,
        limit: getState().products.list.pagination.limit
      });

      dispatch({ type: types.SET_LIST_ITEMS, items: [...getState().products.list.items, ...products.items] });
      dispatch({ type: types.SET_LIST_PAGE, page: getState().products.list.pagination.page + 1 });
      dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: products.totalCount });
      dispatch({ type: types.SET_LIST_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_LIST_ERROR, error });
      dispatch({ type: types.SET_LIST_LOADING, loading: false });
    }
  };
}

export function fetchWarehousesBySelectedProduct() {
  return async (dispatch, getState) => {
    try {
      const state = getState();

      dispatch({ type: types.SET_SELECTED_WAREHOUSES_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_WAREHOUSES_LOADING, loading: true });

      const warehouses = await warehousesApi.fetchWarehousesListByProduct({ productId: state.products.selected.item.id });

      dispatch({ type: types.SET_SELECTED_WAREHOUSES_ITEMS, items: [...state.products.selected.warehouses.items, ...warehouses] });
      dispatch({ type: types.SET_SELECTED_WAREHOUSES_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_WAREHOUSES_ERROR, error });
      dispatch({ type: types.SET_SELECTED_WAREHOUSES_LOADING, loading: false });
    }
  };
}

export function clearProducts() {
  return dispatch => {
    dispatch({ type: types.SET_LIST_ITEMS, items: [] });
    dispatch({ type: types.SET_SELECTED_WAREHOUSES_ITEMS, items: [] });
  };
}

export function clearSelectedProduct() {
  return dispatch => {
    dispatch({ type: types.SET_SELECTED_ITEM, product: {} });
    dispatch({ type: types.SET_SELECTED_ERROR, error: null });
    dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    dispatch({ type: types.SET_SELECTED_WAREHOUSES_ITEMS, items: [] });
    dispatch({ type: types.SET_SELECTED_WAREHOUSES_ERROR, error: null });
    dispatch({ type: types.SET_SELECTED_WAREHOUSES_LOADING, loading: false });
    dispatch({ type: types.SET_SELECTED_WAREHOUSES_FOR_DELETE, warehousesForDelete: [] });
  };
}

export function editProduct({ title, quantity }) {
  return async (dispatch, getState) => {
    const product = {};

    if (title) product["title"] = title;
    if (quantity >= 0) {
      product["quantity"] = quantity;
      product["freeQuantity"] = quantity - getState().products.selected.warehouses.items.reduce((start, warehouse) => start + warehouse.quantity, 0);
    }

    dispatch({ type: types.SET_SELECTED_ITEM, product: { ...getState().products.selected.item, ...product } });
  };
}

export function saveProduct(withoutUpdateWarehouses) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_SELECTED_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: true });

      if (getState().products.selected.warehouses.items.findIndex(warehouseItem => !warehouseItem.warehouse) !== -1) throw new Error("Not all warehouse are selected, check the fields");

      const id = getState().products.selected.item.id;
      const items = getState().products.list.items;

      let product;

      if (id) {
        const editProductIndexInArray = items.findIndex(item => item.id === id);

        product = await productsApi.editProduct({
          ...getState().products.selected.item,
          warehousesDistributions: getState().products.selected.warehouses.items,
          warehousesForDelete: getState().products.selected.warehousesForDelete
        });

        if (editProductIndexInArray !== -1) items[editProductIndexInArray] = product;
      } else {
        product = await productsApi.createProduct({
          ...getState().products.selected.item,
          warehousesDistributions: getState().products.selected.warehouses.items,
          warehousesForDelete: getState().products.selected.warehousesForDelete
        });

        if (getState().products.list.pagination.totalCount === getState().products.list.items.length) {
          items.push(product);
          dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: getState().products.list.pagination.totalCount + 1 });
        }
      }

      if (!withoutUpdateWarehouses) await dispatch(updateWarehouses({ warehousesDistributions: getState().products.selected.warehouses.items }));

      dispatch({ type: types.SET_LIST_ITEMS, items: [...items] });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_ERROR, error });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    }
  };
}

export function removeProduct() {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.SET_SELECTED_ERROR, error: null });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: true });

      await productsApi.removeProduct(getState().products.selected.item);
      await dispatch(updateWarehouses({ warehousesDistributions: getState().products.selected.warehouses.items, skipEdited: true }));

      dispatch({ type: types.SET_LIST_TOTAL_COUNT, totalCount: getState().products.list.pagination.totalCount - 1 });
      dispatch({ type: types.SET_LIST_ITEMS, items: [...getState().products.list.items.filter(item => item.id !== getState().products.selected.item.id)] });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    } catch (error) {
      dispatch({ type: types.SET_SELECTED_ERROR, error });
      dispatch({ type: types.SET_SELECTED_LOADING, loading: false });
    }
  };
}

export function reloadProuduct(product) {
  return async (dispatch, getState) => {
    dispatch({ type: types.SET_SELECTED_ITEM, product });
    await dispatch(fetchWarehousesBySelectedProduct());
    await dispatch(saveProduct(true));
    dispatch(clearSelectedProduct());
  };
}

export function addWarehouseForProduct() {
  return async (dispatch, getState) => {
    const productWarehouse = getState().products.selected.warehouses.items;

    productWarehouse.push({
      id: uuid(),
      warehouse: null,
      quantity: 0,
      isNew: true
    });

    dispatch({
      type: types.SET_SELECTED_WAREHOUSES_ITEMS,
      items: [...productWarehouse]
    });
  };
}

export function editWarehouseForProduct({ warehouseDistributions, warehouse, quantity }) {
  return async (dispatch, getState) => {
    const selectedProduct = getState().products.selected.item;

    if (warehouse) {
      if (!warehouseDistributions["firstWarehouse"]) warehouseDistributions["firstWarehouse"] = warehouseDistributions.warehouse;

      warehouseDistributions.warehouse = warehouse;
    }
    if (quantity >= 0 && selectedProduct["freeQuantity"] + warehouseDistributions.quantity >= quantity) {
      warehouseDistributions.quantity = quantity;
      selectedProduct["freeQuantity"] = selectedProduct.quantity - getState().products.selected.warehouses.items.reduce((start, warehouse) => start + warehouse.quantity, 0);
    }

    warehouseDistributions["edited"] = true;

    dispatch({
      type: types.SET_SELECTED_WAREHOUSES_ITEMS,
      items: [...getState().products.selected.warehouses.items]
    });
    dispatch({
      type: types.SET_SELECTED_ITEM,
      product: { ...getState().products.selected.item }
    });
  };
}

export function removeWarehouseFromProduct(warehouseDistributions) {
  return async (dispatch, getState) => {
    const productsWarehouse = getState().products.selected.warehouses.items;
    const indexOfWarehouseDistributions = productsWarehouse.indexOf(warehouseDistributions);
    const selectedProduct = getState().products.selected.item;

    if (indexOfWarehouseDistributions === -1) return console.warn("No found warehouseDistributions for remove");

    selectedProduct["freeQuantity"] += productsWarehouse[indexOfWarehouseDistributions].quantity;
    productsWarehouse.splice(indexOfWarehouseDistributions, 1);

    dispatch(addProductForDelete(warehouseDistributions));
    dispatch({
      type: types.SET_SELECTED_WAREHOUSES_ITEMS,
      items: [...productsWarehouse]
    });
    dispatch({
      type: types.SET_SELECTED_ITEM,
      product: { ...getState().products.selected.item }
    });
  };
}

export function addProductForDelete(warehouseDistributions) {
  return async (dispatch, getState) => {
    if (!warehouseDistributions.isNew) {
      const warehousesForDelete = getState().products.selected.warehousesForDelete;

      warehousesForDelete.push(warehouseDistributions);

      dispatch({
        type: types.SET_SELECTED_WAREHOUSES_FOR_DELETE,
        warehousesForDelete: [...warehousesForDelete]
      });
    }
  };
}

export function updateWarehouses({ warehousesDistributions, skipEdited }) {
  return async (dispatch, getState) => {
    for (let warehouseDistributions of warehousesDistributions) {
      if (warehouseDistributions.edited || skipEdited) {
        await dispatch(warehousesActions.reloadWarehouse(warehouseDistributions.warehouse));

        if (warehouseDistributions.firstWarehouse) await dispatch(warehousesActions.reloadWarehouse(warehouseDistributions.firstWarehouse));
      }
    }

    for (let warehouseDistributions of getState().products.selected.warehousesForDelete) {
      await dispatch(warehousesActions.reloadWarehouse(warehouseDistributions.warehouse));
    }
  };
}
