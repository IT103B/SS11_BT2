const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const validateDevice = (device) => {
  if (!isObject(device)) {
    throw new TypeError("Thiết bị phải là một object.");
  }
  if (typeof device.name !== "string" || device.name.trim() === "") {
    throw new TypeError("Tên thiết bị là bắt buộc.");
  }
  if (typeof device.room !== "string" || device.room.trim() === "") {
    throw new TypeError("Tên phòng là bắt buộc.");
  }
  if (typeof device.powerWatts !== "number" || !Number.isFinite(device.powerWatts) || device.powerWatts <= 0) {
    throw new TypeError("Công suất phải là một số lớn hơn 0.");
  }
};

const validateList = (list) => {
  if (!Array.isArray(list)) {
    throw new TypeError("Danh sách thiết bị phải là một array.");
  }
};

const createDevice = (list, newDev) => {
  validateList(list);
  validateDevice(newDev);

  let nextNumber = 1;
  let id = "";
  let idExists = true;

  while (idExists) {
    id = `DEV_${String(nextNumber).padStart(3, "0")}`;
    idExists = list.some((device) => device.id === id);
    nextNumber += 1;
  }

  const device = {
    id,
    name: newDev.name.trim(),
    room: newDev.room.trim(),
    powerWatts: newDev.powerWatts,
    isActive: newDev.isActive === undefined ? true : newDev.isActive,
  };

  if (typeof device.isActive !== "boolean") {
    throw new TypeError("Trạng thái isActive phải là true hoặc false.");
  }

  list.push(device);
  return device;
};

const readDevicesByRoom = (list, roomName) => {
  validateList(list);
  if (typeof roomName !== "string" || roomName.trim() === "") {
    throw new TypeError("Tên phòng cần tìm là bắt buộc.");
  }

  const normalizedRoomName = roomName.trim().toLowerCase();
  return list.filter((device) => device.room.toLowerCase() === normalizedRoomName);
};

const updateDevice = (list, id, updateData) => {
  validateList(list);
  if (!isObject(updateData)) {
    throw new TypeError("Dữ liệu cập nhật phải là một object.");
  }

  const targetDevice = list.find((device) => device.id === id);
  if (targetDevice === undefined) return false;

  const allowedFields = ["name", "room", "powerWatts", "isActive"];
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    throw new TypeError("Cần cung cấp ít nhất một trường để cập nhật.");
  }

  fields.forEach((field) => {
    if (!allowedFields.includes(field)) {
      throw new TypeError(`Không hỗ trợ cập nhật trường "${field}".`);
    }
  });

  if (updateData.name !== undefined && (typeof updateData.name !== "string" || updateData.name.trim() === "")) {
    throw new TypeError("Tên thiết bị phải là chuỗi không rỗng.");
  }
  if (updateData.room !== undefined && (typeof updateData.room !== "string" || updateData.room.trim() === "")) {
    throw new TypeError("Tên phòng phải là chuỗi không rỗng.");
  }
  if (updateData.powerWatts !== undefined
    && (typeof updateData.powerWatts !== "number" || !Number.isFinite(updateData.powerWatts) || updateData.powerWatts < 0)) {
    throw new TypeError("Công suất cập nhật phải là một số không âm.");
  }
  if (updateData.isActive !== undefined && typeof updateData.isActive !== "boolean") {
    throw new TypeError("Trạng thái isActive phải là true hoặc false.");
  }

  fields.forEach((field) => {
    const value = updateData[field];
    if (value !== undefined) {
      targetDevice[field] = typeof value === "string" ? value.trim() : value;
    }
  });

  return true;
};

const deleteDevice = (list, id) => {
  validateList(list);
  const index = list.findIndex((device) => device.id === id);
  if (index === -1) return false;

  list.splice(index, 1);
  return true;
};

const runDemo = () => {
  const devices = [];

  console.log("Tạo thiết bị:", createDevice(devices, {
    name: "Điều hòa phòng khách",
    room: "Phòng khách",
    powerWatts: 1200,
  }));
  console.log("Tạo thiết bị:", createDevice(devices, {
    name: "Đèn ngủ",
    room: "Phòng ngủ",
    powerWatts: 8,
  }));
  console.log("Thiết bị phòng ngủ:", readDevicesByRoom(devices, "Phòng ngủ"));
  console.log("Tắt điều hòa:", updateDevice(devices, "DEV_001", { isActive: false }));
  console.log("Đặt công suất đèn ngủ về 0W:", updateDevice(devices, "DEV_002", { powerWatts: 0 }));
  console.log("Sau khi cập nhật:", devices);
  console.log("Xóa đèn ngủ:", deleteDevice(devices, "DEV_002"));
  console.log("Xóa mã không tồn tại:", deleteDevice(devices, "DEV_999"));
  console.log("Danh sách cuối:", devices);
};

if (typeof module !== "undefined" && require.main === module) {
  runDemo();
}

if (typeof module !== "undefined") {
  module.exports = {
    createDevice,
    readDevices: readDevicesByRoom,
    readDevicesByRoom,
    updateDevice,
    deleteDevice,
    validateDevice,
  };
}
