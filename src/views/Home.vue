<template>
  <div class="home" v-loading.fullscreen.lock="fullscreenLoading">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Instructions for use</span>
      </div>
      <div class="word-css">
        1. Download the provided template; <br />
        2. Fill in data according to the fields provided by the template; <br />
        3. Upload the form and click the submit button; <br />
        4. Click the download button to get the data on the chain
      </div>
    </el-card>

    <el-card class="box-card">
      <div class="download-lay">
        <p>Excel Template</p>
        <el-button type="primary" @click="download" round>Download</el-button>
      </div>
    </el-card>
    <el-card class="box-card">
      <div>
        <div class="input_area">
          <div class="input_temp">
            <span v-if="!fileName" @click.stop="submitForm" class="placehodel">
              Please upload data excel
            </span>
            <div class="file_wraps" v-else>
              <span class="file_name">{{ fileName }}</span>
              <span @click.stop="clearFile" class="clearFileBtn">x</span>
            </div>
          </div>
          <span class="upload_icon" @click.stop="submitForm"></span>
        </div>
        <input
          type="file"
          ref="upload"
          accept=".xls,.xlsx"
          class="outputlist_upload"
          style="display: none"
        />
      </div>
      <div class="table-area" v-if="billList.length > 0">
        <el-table
          empty-text="No Data"
          border
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column prop="id" fixed label="ID" width="100">
          </el-table-column>
          <el-table-column prop="item_name" label="ItemName" width="180">
          </el-table-column>
          <el-table-column prop="amount" label="Amount" width="180">
          </el-table-column>
          <el-table-column prop="category" label="Category" width="180">
          </el-table-column>
          <el-table-column
            prop="unit"
            label="Unit"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="barcode_value"
            label="BarcodeValue"
            width="180"
          >
          </el-table-column>
          <el-table-column
            prop="storage_location"
            label="StorageLocation"
            width="180"
          >
          </el-table-column>
          <el-table-column prop="status" label="Status" width="180">
          </el-table-column>
          <el-table-column prop="update_time" label="UpdateTime" width="180">
          </el-table-column>
        </el-table>
        <div class="ont-page">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pageNumber"
            :page-size="pageSize"
            layout="prev,pager, next"
            :total="billList.length"
          >
          </el-pagination>
        </div>
        <div class="ont-page">
          <el-button @click="handlersendAttestation"> Submit Data </el-button>
        </div>
      </div>
    </el-card>
    <el-card v-if="resultList.length > 0" class="box-card">
      <div slot="header" class="clearfix">
        <span>Result</span>
      </div>
      <div class="table-area">
        <el-table
          empty-text="No Data"
          border
          :data="resultTable"
          style="width: 100%"
        >
          <el-table-column prop="id" fixed label="ID" width="100">
          </el-table-column>
          <el-table-column prop="item_name" label="ItemName" width="180">
          </el-table-column>
          <el-table-column prop="amount" label="Amount" width="180">
          </el-table-column>
          <el-table-column prop="category" label="Category" width="180">
          </el-table-column>
          <el-table-column
            prop="unit"
            label="Unit"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="barcode_value"
            label="BarcodeValue"
            width="180"
          >
          </el-table-column>
          <el-table-column
            prop="storage_location"
            label="StorageLocation"
            width="180"
          >
          </el-table-column>
          <el-table-column prop="status" label="Status" width="180">
          </el-table-column>
          <el-table-column prop="update_time" label="UpdateTime" width="180">
          </el-table-column>
          <el-table-column prop="sha256" label="sha256" width="180">
          </el-table-column>
          <el-table-column
            prop="txHash"
            fixed="right"
            label="HashLink"
            width="280"
          >
            <template slot-scope="scope">
              <a :href="scope.row.txHash" target="_blank">
                {{ scope.row.txHash }}
              </a>
            </template>
          </el-table-column>
        </el-table>
        <div class="ont-page">
          <el-pagination
            @current-change="handleCurrentChangeHash"
            :current-page="pageNumberHash"
            :page-size="pageSize"
            layout="prev,pager, next"
            :total="resultList.length"
          >
          </el-pagination>
        </div>
        <div class="ont-page">
          <el-button @click="handlerExport"> Download Data </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import XLSX from "xlsx";
import { export_json_to_excel } from "../assets/js/Export2Excel";
import { sendAttestation } from "../api";
export default {
  data() {
    return {
      fileName: "",
      billList: [],
      pageNumber: 1,
      pageSize: 10,
      resultList: [],
      pageNumberHash: 1,
      fullscreenLoading: false,
      keyArr:[]
    };
  },
  computed: {
    tableData() {
      let start = (this.pageNumber - 1) * this.pageSize;
      let end = this.pageNumber * this.pageSize;
      return this.billList.slice(start, end);
    },
    resultTable() {
      let start = (this.pageNumberHash - 1) * this.pageSize;
      let end = this.pageNumberHash * this.pageSize;
      return this.resultList.slice(start, end);
    }
  },
  methods: {
    transformData(originData) {
      let keyObj = originData.slice(0, 1)[0];
      let currentData = originData.slice(1);
      let keyArr = Object.values(keyObj);
      keyArr.push("type");
      let resultArr = [];
      currentData.map((item, index) => {
        let a = {};
        let b = Object.values(item);
        keyArr.map((ele, idx) => {
          a[ele] = b[idx];
        });
        resultArr.push(a);
      });
      return {
        resultArr,
        keyArr
      };
    },
    async handlersendAttestation() {
      this.fullscreenLoading = true;
      const apiResult = await sendAttestation(this.billList);
      console.log("result", apiResult);
      this.fullscreenLoading = false;
      const { result, error, desc } = apiResult;
      if (error === 0) {
        this.resultList = result;
      } else {
        this.$message.error(desc);
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
    },
    exportToExcel(arr) {
      //excel数据导出
      const tHeader = [
        ...this.keyArr,
        "sha256",
        "txHash"
      ];
      const filterVal = [
        ...this.keyArr,
        "sha256",
        "txHash"
      ];
      const data = this.formatJson(filterVal, arr);
      export_json_to_excel(tHeader, data, "result_data");
    },
    handlerExport() {
      this.exportToExcel(this.resultList);
    },
    handleCurrentChange(val) {
      this.pageNumber = val;
    },
    handleCurrentChangeHash(val) {
      this.pageNumberHash = val;
    },
    submitForm() {
      this.$refs.upload.click();
    },
    download() {
      window.open("./template.xlsx", "_blank");
    },
    readExcel(e) {
      //表格导入
      var that = this;
      const files = e.target.files;
      // console.log(files)
      if (files.length <= 0) {
        //如果没有文件名
        return false;
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$Message.error(
          "The file format is incorrect. Please upload a file in xls or xlsx format!"
        );
        return false;
      }

      that.fileName = files[0].name;
      const fileReader = new FileReader();
      console.log("fileReader", fileReader);
      fileReader.onload = ev => {
        try {
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: "binary"
          });
          const wsname = workbook.SheetNames[0]; //取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); //生成json表格内容
          console.log("ws", JSON.stringify(ws));
          // that.billList = [...ws]; //清空接收数据
          that.billList = that.transformData(ws).resultArr
          that.keyArr = that.transformData(ws).keyArr
          // for (var i = 0; i < ws.length; i++) {
          //   if (ws[i].address && ws[i].amount) {
          //     var sheetData = {
          //       address: ws[i].address,
          //       amount: ws[i].amount
          //     };
          //     that.billList.push(sheetData);
          //   }
          // }
        } catch (e) {
          throw e;
          return false;
        }
      };
      fileReader.readAsBinaryString(files[0]);
    }
  },
  async mounted() {
    this.$refs.upload.addEventListener("change", async e => {
      await this.readExcel(e);
      this.$refs.upload.value = "";
    });
  }
};
</script>

<style scoped lang='scss'>
.home {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
/deep/ .clearfix {
  span {
    font-weight: 600;
  }
}
.word-css {
  font-size: 16px;
  line-height: 24px;
}
.box-card {
  margin-bottom: 20px;
  &:nth-last-of-type(1) {
    margin-bottom: 0;
  }
}
.download-lay {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  p {
    margin-bottom: 14px;
    line-height: 22px;
  }
  /deep/ .el-button {
    span {
      color: #fff !important;
    }
  }
}
.input_area {
  display: flex;
  justify-content: space-between;
  height: 45px;
  align-items: center;
  cursor: pointer;
  span.upload_icon {
    width: 25px;
    height: 26px;
    background: url(../assets/upload_black.svg) no-repeat center;
    background-size: contain;
    margin-left: 15px;
    cursor: pointer;
    transition: all 0.5s;
    &:hover {
      opacity: 0.6;
    }
  }
  .input_temp {
    flex: 1;
    height: 100%;
    line-height: 45px;
    padding-left: 17px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    span.placehodel {
      display: block;
      width: 100%;
      font-size: 12px;
      color: rgba(30, 30, 30, 0.3);
    }
    span.file_name {
      color: #000;
      font-size: 12px;
    }
    .file_wraps {
      display: flex;
      width: 100%;
      height: 45px;
      justify-content: space-between;
      align-items: center;
      padding-right: 10px;
      &:hover {
        .clearFileBtn {
          visibility: visible;
          opacity: 0.6;
        }
      }
      .clearFileBtn {
        visibility: hidden;
        opacity: 0;
        transition: all 0.6s;
      }
    }
  }
}
.table-area {
  margin-top: 20px;
}
.ont-page {
  text-align: right;
  margin-top: 20px;
}
a {
  color: blue;
  text-decoration: underline;
}
</style>