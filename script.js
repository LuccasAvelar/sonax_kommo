define(["jquery", "underscore", "twigjs"], ($, _, Twig) => {
  var CustomWidget = function () {
    
    var system = this.system()

    this.getTemplate = _.bind(function (template, params, callback) {
      params = typeof params == "object" ? params : {}
      template = template || ""

      return this.render(
        {
          href: "/templates/" + template + ".twig",
          base_path: this.params.path,
          v: this.get_version(),
          load: callback,
        },
        params,
      )
    }, this)

    this.callbacks = {
      render: () => {
        console.log(this)
        // console.log('render');
        return true
      },
      init: _.bind(() => {
        console.log("init")

        if (typeof AMOCRM !== "undefined" && AMOCRM.addNotificationCallback) {
          AMOCRM.addNotificationCallback(this.get_settings().widget_code, (data) => {
            // console.log(data)
          })
        }

        this.add_action("phone", (data) => {
          this.crm_post(
            /* Send the request to your voip service
             * to perform dialing the number
             * The method crm_post (url, data, callback, type, error)
             */
            // Using fixed webhook URL instead of configurable init_call
            "https://n8n.sonax.io/webhook/5c0eace9-b5e7-4dc3-8633-154143ce7293",
            {
              number: data.value,
              app_id: this.params.app_key,
              token: this.params.token,
              system: system,
              phones: this.params.phones,
            },
            (msg) => {
              alert("Chamada iniciada")
              console.log(system)
            },
            "text",
            () => {
              // alert('Error');
            },
          )
        })

        return true
      }, this),
      bind_actions: () => {
        console.log("bind_actions")
        return true
      },
      settings: () => true,
      onSave: () => {
        console.log(this)
        return true
      },
      destroy: () => {},
      contacts: {
        //select contacts in list and clicked on widget name
        selected: () => {
          console.log("contacts")
        },
      },
      leads: {
        //select leads in list and clicked on widget name
        selected: () => {
          console.log("leads")
        },
      },
      tasks: {
        //select tasks in list and clicked on widget name
        selected: () => {
          console.log("tasks")
        },
      },
      advancedSettings: _.bind(() => {
        var $work_area = $("#work-area-" + this.get_settings().widget_code),
          $save_button = $(
            Twig({ ref: "/tmpl/controls/button.twig" }).render({
              text: "Save",
              class_name: "button-input_blue button-input-disabled js-button-save-" + this.get_settings().widget_code,
              additional_data: "",
            }),
          ),
          $cancel_button = $(
            Twig({ ref: "/tmpl/controls/cancel_button.twig" }).render({
              text: "Cancel",
              class_name: "button-input-disabled js-button-cancel-" + this.get_settings().widget_code,
              additional_data: "",
            }),
          )

        console.log("advancedSettings")

        $save_button.prop("disabled", true)
        $(".content__top__preset").css({ float: "left" })

        $(".list__body-right__top")
          .css({ display: "block" })
          .append('<div class="list__body-right__top__buttons"></div>')
        $(".list__body-right__top__buttons").css({ float: "right" }).append($cancel_button).append($save_button)

        this.getTemplate("advanced_settings", {}, (template) => {
          var $page = $(
            template.render({ widget_code: this.get_settings().widget_code }),
          )

          $work_area.append($page)
        })
      }, this),

      /**
       * The method is triggered when the user includes one of the handlers in the Salesbot constructor
       * Salesbot's JSON code needs to be returned
       *
       * @param handler_code - Code of the handler that we provide. It is described in manifest.json. In the example equals to: handler_code
       * @param params - Widget settings are being transmitted in the following format:
       * {
       *   button_title: "TEST",
       *   button_caption: "TEST",
       *   text: "{{lead.cf.10929}}",
       *   number: "{{lead.price}}",
       *   url: "{{contact.cf.10368}}"
       * }
       *
       * @return {{}}
       */
      onSalesbotDesignerSave: (handler_code, params) => {
        var salesbot_source = {
            question: [],
            require: [],
          },
          button_caption = params.button_caption || "",
          button_title = params.button_title || "",
          text = params.text || "",
          number = params.number || 0,
          handler_template = {
            handler: "show",
            params: {
              type: "buttons",
              value: text + " " + number,
              buttons: [button_title + " " + button_caption],
            },
          }

        console.log(params)

        salesbot_source.question.push(handler_template)

        return JSON.stringify([salesbot_source])
      },
    }
    return this
  }

  return CustomWidget
})

