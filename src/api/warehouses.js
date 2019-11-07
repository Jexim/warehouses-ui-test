import axios from "axios";
import apiConfig from "../config/api";

export async function fetchWarehousesList({ page, limit, searchString = "" }) {
  try {
    const response = await axios.get(`${apiConfig.url}/warehouses?_page=${page}&_limit=${limit}&title_like=${searchString}`);

    return {
      items: response.data,
      totalCount: response.headers["x-total-count"]
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchWarehousesListByProduct({ productId } = {}) {
  try {
    const response = await axios.get(`${apiConfig.url}/products/${productId}/warehousesProducts?_expand=warehouse`);

    return response.data
  } catch (error) {
    throw error;
  }
}

export async function createWarehouse({ title, productsDistributions }) {
  try {
    const productsQuantity = productsDistributions.reduce((sum, productDistributions) => sum + productDistributions.quantity, 0);
    const response = await axios.post(`${apiConfig.url}/warehouses`, { title, productsQuantity });

    for (let productsDistribution of productsDistributions) {
      if (productsDistribution.quantity > 0) {
        await axios.post(`${apiConfig.url}/warehousesProducts`, {
          warehouseId: response.data.id,
          productId: productsDistribution.product.id,
          quantity: productsDistribution.quantity
        });
      }
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function editWarehouse({ id, title, productsDistributions, productsForDelete, productsForMove }) {
  try {
    const productsQuantity = productsDistributions.reduce((sum, productDistributions) => sum + productDistributions.quantity, 0);
    const response = await axios.put(`${apiConfig.url}/warehouses/${id}`, { title, productsQuantity });

    for (let productsDistribution of productsDistributions) {
      if (productsDistribution.isNew && productsDistribution.quantity > 0) {
        await axios.post(`${apiConfig.url}/warehousesProducts`, {
          warehouseId: response.data.id,
          productId: productsDistribution.product.id,
          quantity: productsDistribution.quantity
        });
      } else {
        if (productsDistribution.edited && !productsDistribution.isNew) {
          if (productsDistribution.quantity > 0) {
            await axios.put(`${apiConfig.url}/warehousesProducts/${productsDistribution.id}`, {
              warehouseId: response.data.id,
              productId: productsDistribution.product.id,
              quantity: productsDistribution.quantity
            });
          } else {
            await axios.delete(`${apiConfig.url}/warehousesProducts/${productsDistribution.id}`);
          }
        }
      }
    }

    for (let productForMove of productsForMove) {
      for (let warehouseDistributions of productForMove.warehousesDistributions) {
        if (warehouseDistributions.quantity > 0) {
          const responseWarehousesProducts = await axios.get(`${apiConfig.url}/warehousesProducts?productId=${productForMove.productDistributions.product.id}&warehouseId=${warehouseDistributions.warehouse.id}`);
          
          if (responseWarehousesProducts.data.length) {
            await axios.put(`${apiConfig.url}/warehousesProducts/${responseWarehousesProducts.data[0].id}`, {
              warehouseId: warehouseDistributions.warehouse.id,
              productId: productForMove.productDistributions.product.id,
              quantity: responseWarehousesProducts.data[0].quantity + warehouseDistributions.quantity
            });
          } else {
            await axios.post(`${apiConfig.url}/warehousesProducts`, {
              warehouseId: warehouseDistributions.warehouse.id,
              productId: productForMove.productDistributions.product.id,
              quantity: warehouseDistributions.quantity
            });
          }
        }
      }
    }

    for (const productForDelete of productsForDelete) {
      await axios.delete(`${apiConfig.url}/warehousesProducts/${productForDelete.id}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function removeWarehouse(warehouse) {
  try {
    const response = await axios.delete(`${apiConfig.url}/warehouses/${warehouse.id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
}
