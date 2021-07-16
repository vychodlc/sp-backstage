<template>
  <div id="dashboard">
    <div class="topItems">
      <div class="topItem topItemActive" id="topItem1" @click="changeTab(0)">
        <div class="topBox">
          <div class="left"><i class="el-icon-menu"></i></div>
          <div class="right">
            <div class="title">文章上线数目</div>
            <div class="number">{{data.post_online_num}}</div>
          </div>
          <div class="right" v-show="activeTab==0">
            <div class="title">近7日新增</div>
            <div class="number">{{data.new_post_num}}</div>
          </div>
        </div>
      </div>
      <div class="topItem" id="topItem2" @click="changeTab(1)">
        <div class="topBox">
          <div class="left"><i class="el-icon-menu"></i></div>
          <div class="right">
            <div class="title">库存数量</div>
            <div class="number">{{data.storage_num}}</div>
          </div>
          <div class="right" v-show="activeTab==1">
            <div class="title">近7日新增</div>
            <div class="number">{{data.new_storage_num}}</div>
          </div>
        </div>
      </div>
      <div class="topItem" id="topItem3" @click="changeTab(2)">
        <div class="topBox">
          <div class="left"><i class="el-icon-menu"></i></div>
          <div class="right">
            <div class="title">代购单数</div>
            <div class="number">{{data.agency_num}}</div>
          </div>
          <div class="right" v-show="activeTab==2">
            <div class="title">近7日新增</div>
            <div class="number">{{data.new_agency_num}}</div>
          </div>
        </div>
      </div>
      <div class="topItem" id="topItem4" @click="changeTab(3)">
        <div class="topBox">
          <div class="left"><i class="el-icon-menu"></i></div>
          <div class="right">
            <div class="title">用户数</div>
            <div class="number">{{data.user_num}}</div>
          </div>
          <div class="right" v-show="activeTab==3">
            <div class="title">近7日新增</div>
            <div class="number">{{data.new_user_num}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="content" v-show="activeTab==0">
        <div id="echarts_box1" style="width: 78vw; height: 60vh;"></div>
      </div>
      <div class="content" v-show="activeTab==1">
        <div id="echarts_box2" style="width: 78vw; height: 60vh;"></div>
      </div>
      <div class="content" v-show="activeTab==2">
        <div id="echarts_box3" style="width: 78vw; height: 60vh;"></div>
      </div>
      <!-- <div class="content" v-show="activeTab==3">
        <div id="echarts_box4" style="width: 78vw; height: 60vh;"></div>
      </div> -->
    </div>
  </div>
</template>

<script>
  import { getData } from '@/network/dashboard.js'
  export default {
    name: "Dashboard",
    data () {
    return {
      data: {},
      activeTab: 0,
    }
    },
    methods:{
      changeTab(tab) {
        if(tab!=this.activeTab) {
          if(tab==0) {
            document.getElementById('topItem1').className = 'topItem topItemActive'
            document.getElementById('topItem2').className = 'topItem'
            document.getElementById('topItem3').className = 'topItem'
            document.getElementById('topItem4').className = 'topItem'
          } else if(tab==1) {
            document.getElementById('topItem2').className = 'topItem topItemActive'
            document.getElementById('topItem1').className = 'topItem'
            document.getElementById('topItem3').className = 'topItem'
            document.getElementById('topItem4').className = 'topItem'
          } else if(tab==2) {
            document.getElementById('topItem3').className = 'topItem topItemActive'
            document.getElementById('topItem1').className = 'topItem'
            document.getElementById('topItem2').className = 'topItem'
            document.getElementById('topItem4').className = 'topItem'
          } else if(tab==3) {
            document.getElementById('topItem4').className = 'topItem topItemActive'
            document.getElementById('topItem1').className = 'topItem'
            document.getElementById('topItem2').className = 'topItem'
            document.getElementById('topItem3').className = 'topItem'
          }
          this.activeTab = tab;
        }
      },
      chartInit1(data) {
        let tag_data = []
        data.tag.map(tag=>{
          tag_data.push({name:tag.name,value:tag.tag_num})
        })
        var colorList = ['#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac']
        let option = {
          tooltip: {
            formatter: function(param) {
              if (param.data.type == null) {
                return param.data.name + ":" + param.value;
              } else {
                return param.data.type + ":" + param.value;
              }
            }
          },
          series: [{
            type: 'pie',
            radius: [0, '50%'],
            label: {
              position: 'inner',
            },
            itemStyle: {
              normal: {
                borderColor: '#fff',
                borderWidth: 2,
                color: function(params) {
                  return colorList[params.dataIndex]
                }
              }
            },
            selectedMode: 'single',
            data: [
              {value: data.menu.filter(item=>{return item.menu=='品牌'})[0].menu_num,name: '品牌'},
              {value: data.menu.filter(item=>{return item.menu=='种类'})[0].menu_num,name: '种类'},
              {value: data.menu.filter(item=>{return item.menu=='年代'})[0].menu_num,name: '年代'}
            ]
          },{
            type: 'pie',
            radius: ['55%', '80%'],
            itemStyle: {
              normal: {
                color: function(params) {
                  return colorList[params.dataIndex]
                }
              }
            },
            label: {
              normal: {
                formatter: function(params) {
                  if (params.value != 0)
                    return params.data.name + ":" + params.value;
                  else
                    return '';
                },
                show: true,
              },
            },
            data: tag_data
          }]
        };
        this.$echarts.init(document.getElementById('echarts_box1')).setOption(option);
      },
      chartInit2(data) {
        let data1 = {date:[],data:[]};
        let data2 = {date:[],data:[]};
        let data3 = {date:[],data:[]};
        for(let i in data.transship_apply) {
          let key = Object.keys(data.transship_apply[i])[0]
          data1.date.push(key)
          data1.data.push(data.transship_apply[i][key])
        }
        for(let ii in data.transship_outbound) {
          let key = Object.keys(data.transship_outbound[ii])[0]
          data2.date.push(key)
          data2.data.push(data.transship_outbound[ii][key])
        }
        for(let iii in data.transship_storage) {
          let key = Object.keys(data.transship_storage[iii])[0]
          data3.date.push(key)
          data3.data.push(data.transship_storage[iii][key])
        }
        const colorList = ["#9E87FF", '#73DDFF', '#fe9a8b', '#F56948', '#9E87FF']
        let option = {
          legend: {
              icon: 'circle',
              top: '5%',
              right: '5%',
              itemWidth: 6,
              itemGap: 20,
              textStyle: {
                  color: '#556677'
              }
          },
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  label: {
                      show: true,
                      backgroundColor: '#fff',
                      color: '#556677',
                      borderColor: 'rgba(0,0,0,0)',
                      shadowColor: 'rgba(0,0,0,0)',
                      shadowOffsetY: 0
                  },
                  lineStyle: {
                      width: 0
                  }
              },
              backgroundColor: '#fff',
              textStyle: {
                  color: '#5c6c7c'
              },
              padding: [10, 10],
              extraCssText: 'box-shadow: 1px 0 2px 0 rgba(163,163,163,0.5)'
          },
          grid: {
            top: '10%',bottom:'10%'
          },
          xAxis: [{
            type: 'category',
            data: data1.date,
            axisLine: {
              lineStyle: {
                color: '#DCE2E8'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0,
              textStyle: {
                color: '#556677'
              },
              fontSize: 12,
              margin: 15
            },
            axisPointer: {
              label: {
                padding: [0, 0, 0, 0],
                margin: 15,
                fontSize: 12,
                backgroundColor: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0,
                    color: '#fff' // 0% 处的颜色
                  }, {
                    offset: 0.86,
                    color: '#fff' // 0% 处的颜色
                  }, {
                    offset: 0.86,
                    color: '#33c0cd' // 0% 处的颜色
                  }, {
                    offset: 1,
                    color: '#33c0cd' // 100% 处的颜色
                  }],
                  global: false // 缺省为 false
                }
              }
            },
            boundaryGap: false
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
                show: false
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#DCE2E8'
                }
            },
            axisLabel: {
                textStyle: {
                    color: '#556677'
                }
            },
            splitLine: {
                show: false
            }
          }, {
            type: 'value',
            position: 'right',
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#556677'
                },
                formatter: '{value}'
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#DCE2E8'
                }
            },
            splitLine: {
                show: false
            }
          }],
          series: [{
            name: '转运',
            type: 'line',
            data: data1.data,
            symbolSize: 1,
            symbol: 'circle',
            smooth: true,
            yAxisIndex: 0,
            showSymbol: false,
            itemStyle: {
              normal: {
                color: colorList[0],
                borderColor: colorList[0]
              }
            }
            }, {
              name: '出库',
              type: 'line',
              data: data2.data,
              symbolSize: 1,
              symbol: 'circle',
              smooth: true,
              yAxisIndex: 0,
              showSymbol: false,
              itemStyle: {
                normal: {
                  color: colorList[1],
                  borderColor: colorList[1]
                }
              }
            }, {
              name: '库存',
              type: 'line',
              data: data3.data,
              symbolSize: 1,
              symbol: 'circle',
              smooth: true,
              yAxisIndex: 0,
              showSymbol: false,
              itemStyle: {
                normal: {
                  color: colorList[2],
                  borderColor: colorList[2]
                }
              }
            }
          ]
        };
        this.$echarts.init(document.getElementById('echarts_box2')).setOption(option);
      },
      chartInit3(data) {
        var colorList = ['#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac', '#0090ff', '#06d3c4', '#ffbc32', '#2ccc44', '#ff3976', '#6173d6', '#914ce5', '#42b1cc', '#ff55ac']
        let option = {
          tooltip: {
            formatter: function(param) {
              if (param.data.type == null) {
                return param.data.name + ":" + param.value;
              } else {
                return param.data.type + ":" + param.value;
              }
            }
          },
          series: [{
            type: 'pie',
            radius: ['30%', '80%'],
            label: {
              position: 'inner',
            },
            itemStyle: {
              normal: {
                borderColor: '#fff',
                borderWidth: 2,
                color: function(params) {
                  return colorList[params.dataIndex]
                }
              }
            },
            selectedMode: 'single',
            data: [
              {value: data.account_num,name: '购物账号'},
              {value: data.discount_num,name: '折扣码'},
              {value: data.giftcard_num,name: '礼品卡'}
            ]
          }]
        };
        this.$echarts.init(document.getElementById('echarts_box3')).setOption(option);
      }
    },
    mounted() {
      this.$nextTick(() => {
        getData().then(res=>{
          let data = res.data;
          this.data = data;

          let agency_data = []
          data.tag.map(tag=>{
            agency_data.push({name:tag.name,value:tag.tag_num})
          })

          let new_agency_num = 0;
          for(let i in data.agency) {
            let key = Object.keys(data.agency[i])[0]
            new_agency_num += parseInt(data.agency[i][key])
          }
          this.data.new_agency_num = new_agency_num;
          
          let new_storage_num = 0;
          for(let i in data.transship_storage) {
            let key = Object.keys(data.transship_storage[i])[0]
            new_storage_num += parseInt(data.transship_storage[i][key])
          }
          this.data.new_storage_num = new_storage_num;

          this.chartInit1(data);
          this.chartInit2(data);
          this.chartInit3(data);
        })
      });
    }
  }
</script>

<style scoped>
#dashboard {
}
.topItems {
  width: 100%;
  height: 20vh;
  display: flex;
  flex-direction: row;
}
.topItems .topItem {
  flex: 1;
  display: flex;
  color: #545c64;
  justify-content: center;
}
.topItems .topItem .topBox {
  background-color: #fff;
  width: 15vw;
  height: 20vh;
  border: 2px solid #545c64;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
}
.topItems .topItem .topBox .left {
  width: 7vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.topItems .topItem .topBox .left i {
  font-size: 5vw;
}
.topItems .topItem .topBox .right {
  width: 8vw;
  display: flex;
  flex-direction: column;
  margin: 0 2vw;
  justify-content: center;
}
.topItems .topItem .topBox .right .title {
  font-size: 20px;
  margin-bottom: 20px;
}
.topItems .topItem .topBox .right .number {
  font-size: 24px;
  font-weight: bolder;
}
.topItems .topItemActive {
  flex: 2;
  display: flex;
  justify-content: center;
}
.topItems .topItemActive .topBox {
  width: 30vw;
  height: 20vh;
  color: #fff;
  background-color: #545c64;
}
.topItems .topItem:first-child {
  justify-content: flex-start;
}
.topItems .topItem:last-child {
  justify-content: flex-end;
}

.content {
  border: 2px solid #545c64;
  margin-top: 5vh;
  height: 60vh;
  border-radius: 20px;
}
</style>