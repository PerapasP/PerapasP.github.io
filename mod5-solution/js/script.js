// Simulating the required HTML and jQuery environment
global.document = {
  querySelector: (selector) => {
    if (selector === '#main-content') {
      return { className: '', innerHTML: '' };
    } else if (selector === '#navHomeButton') {
      return { className: '', innerHTML: '' };
    } else if (selector === '#navMenuButton') {
      return { className: '', innerHTML: '' };
    } else if (selector === '#navbarToggle') {
      return { className: '', innerHTML: '' };
    } else if (selector === '#collapsable-nav') {
      return { className: '', innerHTML: '', collapse: () => {} };
    }
    return { className: '', innerHTML: '' };
  },
  addEventListener: () => {}
};
global.window = { innerWidth: 800 }; // Added for testing responsiveness
global.$ = (selector) => {
  if (selector === '#navbarToggle') {
    return { blur: (callback) => callback({}) };
  } else if (selector === '#collapsable-nav') {
    return { collapse: (action) => {} };
  }
  return {};
};
global.$ajaxUtils = {
  sendGetRequest: (url, callback, isJSON) => {
    if (url === allCategoriesUrl) {
      callback([{ short_name: "L", name: "Lunch" }, { short_name: "D", name: "Dinner" }, { short_name: "B", name: "Breakfast" }]);
    } else if (url === homeHtmlUrl) {
      callback("<div id='main-content'><h1>Lunch</h1></div>");
    }
  }
};

var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";


// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};


// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {
  // STEP 0: Look over the code
  // STEP 1: Substitute [...] with buildAndShowHomeHTML
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowHomeHTML, // STEP 1: Replaced [...] with buildAndShowHomeHTML
    true); // Explicitly setting the flag to get JSON from server processed into an object literal
});

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Builds HTML for the home page based on categories array
// returned from the server.
function buildAndShowHomeHTML(categories) {
  // Load home snippet page
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {
      // STEP 2: Call chooseRandomCategory
      var chosenCategoryShortName = chooseRandomCategory(categories).short_name;

      // STEP 3: Substitute {{randomCategoryShortName}} with the chosen category
      var homeHtmlToInsertIntoMainPage = insertProperty(
        homeHtml,
        "randomCategoryShortName",
        "'" + chosenCategoryShortName + "'"
      );

      // STEP 4: Insert the produced HTML into the main page
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
    },
    false); // False here because we are getting just regular HTML from the server, so no need to process JSON.
}

// Given array of category objects, returns a random category object.
function chooseRandomCategory(categories) {
  // Choose a random index into the array (from 0 inclusively until array length (exclusively))
  var randomArrayIndex = Math.floor(Math.random() * categories.length);
  // return category object with that randomArrayIndex
  return categories[randomArrayIndex];
}

// Test the implementation
const categories = [
  { short_name: "L", name: "Lunch" },
  { short_name: "D", name: "Dinner" },
  { short_name: "B", name: "Breakfast" }
];

console.log("Testing the implementation:");
console.log("\nStep 1: buildAndShowHomeHTML is passed as the callback");

console.log("\nStep 2: Testing chooseRandomCategory");
const randomCat = chooseRandomCategory(categories);
console.log("Random category selected:", randomCat);

console.log("\nStep 3 & 4: Testing the full buildAndShowHomeHTML function");
buildAndShowHomeHTML(categories);


$(function () {
  // Same as document.addEventListener("DOMContentLoaded"...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {
  var dc = {};

  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";


  // Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML);
  };

  // Load the menu items view
  // 'categoryShort' is a short_name for a category
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML);
  };

  // Builds HTML for the categories page based on the data
  // from the server
  function buildAndShowCategoriesHTML(categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Retrieve single category snippet
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            // Switch CSS class active to menu button
            switchMenuToActive();

            var categoriesViewHtml =
              buildCategoriesViewHtml(categories,
                categoriesTitleHtml,
                categoryHtml);
            insertHtml("#main-content", categoriesViewHtml);
          },
          false);
      },
      false);
  }

  // Using categories data and snippets html
  // build categories view HTML to be inserted into page
  function buildCategoriesViewHtml(categories,
    categoriesTitleHtml,
    categoryHtml) {

    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over categories
    for (var i = 0; i < categories.length; i++) {
      // Insert category values
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html =
        insertProperty(html, "name", name);
      html =
        insertProperty(html,
          "short_name",
          short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Builds HTML for the single category page based on the data
  // from the server
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Load title snippet of menu items page
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Retrieve single menu item snippet
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            // Switch CSS class active to menu button
            switchMenuToActive();

            var menuItemsViewHtml =
              buildMenuItemsViewHtml(categoryMenuItems,
                menuItemsTitleHtml,
                menuItemHtml);
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false);
      },
      false);
  }

  // Using category and menu items data and snippets html
  // build menu items view HTML to be inserted into page
  function buildMenuItemsViewHtml(categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml) {

    menuItemsTitleHtml =
      insertProperty(menuItemsTitleHtml,
        "name",
        categoryMenuItems.category.name);
    menuItemsTitleHtml =
      insertProperty(menuItemsTitleHtml,
        "special_instructions",
        categoryMenuItems.category.special_instructions);

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over menu items
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      // Insert menu item values
      var html = menuItemHtml;
      html =
        insertProperty(html, "short_name", menuItems[i].short_name);
      html =
        insertProperty(html,
          "catShortName",
          catShortName);
      html =
        insertItemPrice(html,
          "price_small",
          menuItems[i].price_small);
      html =
        insertItemPortionName(html,
          "small_portion_name",
          menuItems[i].small_portion_name);
      html =
        insertItemPrice(html,
          "price_large",
          menuItems[i].price_large);
      html =
        insertItemPortionName(html,
          "large_portion_name",
          menuItems[i].large_portion_name);
      html =
        insertProperty(html,
          "name",
          menuItems[i].name);
      html =
        insertProperty(html,
          "description",
          menuItems[i].description);

      // Add clearfix after every second menu item
      if (i % 2 !== 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Appends price with '$' if price exists
  function insertItemPrice(html,
    pricePropName,
    priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Appends portion name in parens if it exists
  function insertItemPortionName(html,
    portionPropName,
    portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  global.$dc = dc;

})(window);