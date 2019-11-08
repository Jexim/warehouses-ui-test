import * as actionTypes from "./actionTypes";

const initialState = {
  selected: {
    item: {},
    warehouses: {
      items: [],
      error: null,
      loading: false,
    },
    error: null,
    loading: false,
    warehousesForDelete: []
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
          item: action.product
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
    case actionTypes.SET_SELECTED_WAREHOUSES_FOR_DELETE:
      return {
        ...state,
        selected: {
          ...state.selected,
          warehousesForDelete: action.warehousesForDelete
        }
      };
    case actionTypes.SET_SELECTED_WAREHOUSES_ITEMS:
      return {
        ...state,
        selected: {
          ...state.selected,
          warehouses: {
            ...state.selected.warehouses,
            items: action.items
          }
        }
      };
    case actionTypes.SET_SELECTED_WAREHOUSES_ERROR:
      return {
        ...state,
        selected: {
          ...state.selected,
          warehouses: {
            ...state.selected.warehouses,
            error: action.error
          }
        }
      };
    case actionTypes.SET_SELECTED_WAREHOUSES_LOADING:
      return {
        ...state,
        selected: {
          ...state.selected,
          warehouses: {
            ...state.selected.warehouses,
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
