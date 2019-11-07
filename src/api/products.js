import axios from "axios";
import apiConfig from "../config/api";

export async function fetchAllProductsList({ page, limit, searchString="" } = {}) {
  try {
    const response = await axios.get(`${apiConfig.url}/products?_page=${page}&_limit=${limit}&title_like=${searchString}`);

    return { 
      items: response.data,
      totalCount: response.headers["x-total-count"]
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchProductsListByWarehouse({ warehouseId } = {}) {
  try {
    const response = await axios.get(`${apiConfig.url}/warehouses/${warehouseId}/warehousesProducts?_expand=product`);

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createProduct({ title, quantity, warehousesDistributions }) {
  try {
    const freeQuantity = quantity - warehousesDistributions.reduce((sum, warehouseDistributions) => sum + warehouseDistributions.quantity, 0);
    const response = await axios.post(`${apiConfig.url}/products`, { title, quantity, freeQuantity });

    for (let warehousesDistribution of warehousesDistributions) {
      if (warehousesDistribution.quantity > 0) {
        await axios.post(`${apiConfig.url}/warehousesProducts`, {
          warehouseId: warehousesDistribution.warehouse.id,
          productId: response.data.id,
          quantity: warehousesDistribution.quantity
        });
      }
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function editProduct({ id, title, quantity, warehousesDistributions, warehousesForDelete }) {
  try {
    const freeQuantity = quantity - warehousesDistributions.reduce((sum, warehouseDistributions) => sum + warehouseDistributions.quantity, 0);
    const response = await axios.put(`${apiConfig.url}/products/${id}`, { title, quantity, freeQuantity });

    for (let warehousesDistribution of warehousesDistributions) {
      if (warehousesDistribution.isNew && warehousesDistribution.quantity > 0) {
        await axios.post(`${apiConfig.url}/warehousesProducts`, {
          warehouseId: warehousesDistribution.warehouse.id,
          productId: id,
          quantity: warehousesDistribution.quantity
        });
      } else {
        if (warehousesDistribution.edited && !warehousesDistribution.isNew) {
          if (warehousesDistribution.quantity > 0) {
            await axios.put(`${apiConfig.url}/warehousesProducts/${warehousesDistribution.id}`, {
              warehouseId: warehousesDistribution.warehouse.id,
              productId: id,
              quantity: warehousesDistribution.quantity
            });
          } else {
            await axios.delete(`${apiConfig.url}/warehousesProducts/${warehousesDistribution.id}`);
          }
        }
      }
    }

    for (const warehouseForDelete of warehousesForDelete) {
      await axios.delete(`${apiConfig.url}/warehousesProducts/${warehouseForDelete.id}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function removeProduct(product) {
  try {
    const response = await axios.delete(`${apiConfig.url}/products/${product.id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
}
