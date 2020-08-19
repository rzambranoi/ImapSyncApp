<template>
    <div id="app">
        <vue-bootstrap4-table :rows="rows" :columns="columns" :config="config" @refresh-data="onRefreshData">
          <template slot="simple-filter-clear-icon">
            <font-awesome-icon icon="times" />
          </template>
          <template slot="refresh-button-text">
            
            <div id ="refresh_button">
            <font-awesome-icon icon="redo-alt" /> Refresh
            </div>
            
            <div  id ="loading_button" style="display:none">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" ></span> 
              Loading...
            </div>  
          </template>
          
        </vue-bootstrap4-table>
    </div>
</template>



<script>
import VueBootstrap4Table from 'vue-bootstrap4-table'

const API_URL = "http://localhost:8081/api/v1/history";

  export default {
    name: 'History',
    
    methods: {
      onRefreshData() {
        this.rows = [];
        document.getElementById("refresh_button").style.display = "none";
        document.getElementById("loading_button").style.display = "";
        setTimeout(function () { 
          this.getData();
          document.getElementById("refresh_button").style.display = "";
          document.getElementById("loading_button").style.display = "none";
        
        }.bind(this), 2000)
      },

      getData(){
        fetch(API_URL,{
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        }).then(res => res.json())
          .then((result) => {

            result.forEach((row)=>{
              switch(row.status){
                case "In Queue":
                  row.status = "🕒";
                  break;
                case "Done":
                  row.status = "✔";
                  break;
                case "Error":
                  row.status = "❌";
                  break;
              }

            });

            this.rows = result;

          });
      },
    },

    mounted () {
      this.getData();
    },
  
    data(){
        return {
            rows:[],
            columns: [
                {
                    label: "Date",
                    name: "date",
                    sort: true,
                },
                {
                    label: "Email",
                    name: "email",
                    filter: {
                        type: "simple",
                        placeholder: "Enter email"
                    },
                    sort: true,
                },
                {
                    label: "Origin IP",
                    name: "ip.origin",
                    filter: {
                        type: "simple",
                        placeholder: "Enter Origin IP"
                    },
                },
                {
                    label: "Destination IP",
                    name: "ip.destination",
                    filter: {
                        type: "simple",
                        placeholder: "Enter Destination IP"
                    },
                },
                {
                    label: "Status",
                    name: "status",
                    sort: false,
                },
                {
                    label: "Options",
                    name: "options",
                    sort: false,
                },
                ],
            config: {
                // checkbox_rows: true,
                // rows_selectable: true,
                multi_column_sort: true,
                card_title: "IMAPSYNC HISTORY",
                show_reset_button: false,
                // show_refresh_button:false,
                global_search: {
                  visibility: false,
                }
            }
        }
    },
    components: {
        VueBootstrap4Table
    }
  }
</script>


<style>
.input-group{
  display: none !important;
}

span{
  display: inline-block;
}
</style>