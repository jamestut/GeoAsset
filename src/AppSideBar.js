import * as React from "react";
import {
  Nav,
  INavLink,
  INavStyles,
  INavLinkGroup,
} from "office-ui-fabric-react/lib/Nav";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import {
  IconButton,
  IIconProps,
  IContextualMenuProps,
  Stack,
  Link,
} from "office-ui-fabric-react";
import "./AppSideBar.css";

const navStyles = {
  root: {
    width: 208,
    height: 350,
    boxSizing: "border-box",
    border: "1px solid #eee",
    overflowY: "auto",
  },
};

const navLinkGroups = [
  {
    links: [
      {
        name: "Home",
        url: "http://example.com",
        expandAriaLabel: "Expand Home section",
        collapseAriaLabel: "Collapse Home section",
        links: [
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
          {
            name: "Activity",
            url: "http://msn.com",
            key: "key1",
            target: "_blank",
          },
          {
            name: "MSN",
            url: "http://msn.com",
            disabled: true,
            key: "key2",
            target: "_blank",
          },
        ],
        isExpanded: true,
      },
    ],
  },
];

// const NavBasicExample = () => {
//   return (
//     <Nav
//       onLinkClick={_onLinkClick}
//       selectedKey="key3"
//       ariaLabel="Nav basic example"
//       styles={navStyles}
//       groups={navLinkGroups}
//     />
//   );
// };

class AppSideBar extends React.Component {
  render() {
    return (
      <div class="appsidebar-cont" style={{width:`${this.props.width}px`}}>
        <div class="appsidebar-search">
          <SearchBox
            styles={{root:{flexGrow: 1}}}
            placeholder="Search" /*onSearch={newValue => console.log('value is ' + newValue)}*/
          />
          <IconButton
            iconProps={{ iconName: "FilterSettings" }}
            title="Sort and filter settings"
            ariaLabel="Sort and filter settings"
          />
        </div>
        <div class="appsidebar-nav-cont">
          <Nav styles={{root:{overflowY: "auto"}}} groups={navLinkGroups} />
        </div>
      </div>
    );
  }
}

export default AppSideBar;
