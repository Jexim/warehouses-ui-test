import * as actionTypes from "./actionTypes";

const initialState = {
  selected: {
    item: null,
    products: {
      items: [],
      error: null,
      loading: false
    },
    error: null,
    loading: false,
    productsForDelete: [],
    productsForMove: []
  },
  list: {
    items: [],
    error: null,
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 0
    }
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_SELECTED_ITEM:
      return {
        ...state,
        selected: {
          ...state.selected,
          item: action.warehouse
        }
      };
    case actionTypes.SET_SELECTED_PRODUCTS_FOR_MOVE:
      return {
        ...state,
        selected: {
          ...state.selected,
          productsForMove: action.productsForMove
        }
      };
    case actionTypes.SET_SELECTED_PRODUCTS_FOR_DELETE:
      return {
        ...state,
        selected: {
          ...state.selected,
          productsForDelete: action.productsForDelete
        }
      };
    case actionTypes.SET_SELECTED_LOADING:
      return {
        ...state,
        selected: {
          ...state.selected,
          loading: action.loading
        }
      };
    case actionTypes.SET_SELECTED_ERROR:
      return {
        ...state,
        selected: {
          ...state.selected,
          error: action.error
        }
      };
    case actionTypes.SET_SELECTED_PRODUCTS_ITEMS:
      return {
        ...state,
        selected: {
          ...state.selected,
          products: {
            ...state.selected.products,
            items: action.items
          }
        }
      };
    case actionTypes.SET_SELECTED_PRODUCTS_ERROR:
      return {
        ...state,
        selected: {
          ...state.selected,
          products: {
            ...state.selected.products,
            error: action.error
          }
        }
      };
    case actionTypes.SET_SELECTED_PRODUCTS_LOADING:
      return {
        ...state,
        selected: {
          ...state.selected,
          products: {
            ...state.selected.products,
            loading: action.loading
          }
        }
      };
    case actionTypes.SET_LIST_ITEMS:
      return {
        ...state,
        list: {
          ...state.list,
          items: action.items
        }
      };
    case actionTypes.SET_LIST_PAGE:
      return {
        ...state,
        list: {
          ...state.list,
          pagination: {
            ...state.list.pagination,
            page: action.page
          }
        }
      };
    case actionTypes.SET_LIST_TOTAL_COUNT:
      return {
        ...state,
        list: {
          ...state.list,
          pagination: {
            ...state.list.pagination,
            totalCount: +action.totalCount
          }
        }
      };
    case actionTypes.SET_LIST_LOADING:
      return {
        ...state,
        list: {
          ...state.list,
          loading: action.loading
        }
      };
    case actionTypes.SET_LIST_ERROR:
      return {
        ...state,
        list: {
          ...state.list,
          error: action.error
        }
      };

    default: {
      return state;
    }
  }
};

export function getWarehousesDistributionsByProductDistributions(store, productDistributions) {
  const indexOfProductDistributions = store.warehouses.selected.productsForMove.findIndex(productForMove => productForMove.productDistributions === productDistributions);

  if (indexOfProductDistributions !== -1) 
    return store.warehouses.selected.productsForMove[indexOfProductDistributions].warehousesDistributions;
  else 
    return [];
}