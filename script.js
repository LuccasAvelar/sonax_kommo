define(["jquery", "underscore", "twigjs"], ($, _, Twig) => {
  var CustomWidget = function () {
    var system = this.system();

    this.getTemplate = _.bind(function (template, params, callback) {
      params = typeof params == "object" ? params : {};
      template = template || "";

      return this.render(
        {
          href: "/templates/" + template + ".twig",
          base_path: this.params.path,
          v: this.get_version(),
          load: callback,
        },
        params,
      );
    }, this);

    this.callbacks = {
      init: _.bind(() => {
        if (typeof APP !== "undefined" && APP.addNotificationCallback) {
          APP.addNotificationCallback(this.get_settings().widget_code, (data) => {});
        }

        const leads = response._embedded.leads;

        this.add_action("phone", (data) => {
          this.crm_post(
            "https://n8n.sonax.io/webhook/5c0eace9-b5e7-4dc3-8633-154143ce7293",
            {
              number: data.value,
              app_id: this.params.app_key,
              token: this.params.token,
              system: system,
              phones: this.params.phones,
              lead: leads,
            },
            () => {
              alert("Chamada iniciada");
            },
            "text",
            () => {}
          );
        });

        return true;
      }, this),

      bind_actions: () => true,
      settings: () => true,
      onSave: () => true,
      destroy: () => {},

      contacts: {
        selected: () => {},
      },
      leads: {
        selected: () => {},
      },
      tasks: {
        selected: () => {},
      },

      advancedSettings: _.bind(() => {
        const $work_area = $("#work-area-" + this.get_settings().widget_code);

        const $save_button = $(
          Twig({ ref: "/tmpl/controls/button.twig" }).render({
            text: "Save",
            class_name: "button-input_blue button-input-disabled js-button-save-" + this.get_settings().widget_code,
            additional_data: "",
          }),
        );

        const $cancel_button = $(
          Twig({ ref: "/tmpl/controls/cancel_button.twig" }).render({
            text: "Cancel",
            class_name: "button-input-disabled js-button-cancel-" + this.get_settings().widget_code,
            additional_data: "",
          }),
        );

        $save_button.prop("disabled", true);
        $(".content__top__preset").css({ float: "left" });

        $(".list__body-right__top")
          .css({ display: "block" })
          .append('<div class="list__body-right__top__buttons"></div>');

        $(".list__body-right__top__buttons")
          .css({ float: "right" })
          .append($cancel_button)
          .append($save_button);

        this.getTemplate("advanced_settings", {}, (template) => {
          const $page = $(template.render({ widget_code: this.get_settings().widget_code }));
          $work_area.append($page);
        });
      }, this),

      onSalesbotDesignerSave: (handler_code, params) => {
        const salesbot_source = {
          question: [],
          require: [],
        };

        const button_caption = params.button_caption || "";
        const button_title = params.button_title || "";
        const text = params.text || "";
        const number = params.number || 0;

        const handler_template = {
          handler: "show",
          params: {
            type: "buttons",
            value: text + " " + number,
            buttons: [button_title + " " + button_caption],
          },
        };

        salesbot_source.question.push(handler_template);

        return JSON.stringify([salesbot_source]);
      },
    };

    return this;
  };

  return CustomWidget;
});
