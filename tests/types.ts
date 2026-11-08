import type { ButtonProps, IconButtonProps, IconProps, CollapsiblePanelProps } from "../dist/index";

type Assert<T extends true> = T;
type Includes<T, U> = U extends T ? true : false;
type Excludes<T, U> = U extends T ? false : true;

type ButtonNativeName = Assert<Includes<ButtonProps["name"], string>>;
type ButtonNativeAria = Assert<Includes<ButtonProps["aria-describedby"], string>>;
type ButtonNativeForm = Assert<Includes<ButtonProps["form"], string>>;
type ButtonVariants = Assert<Excludes<ButtonProps["variant"], "primary">>;
type IconButtonNeedsName = Assert<Excludes<IconButtonProps, { children: null }>>;
type IconLabel = Assert<Includes<IconProps["label"], string>>;
type PanelInitial = Assert<Includes<CollapsiblePanelProps["defaultExpanded"], boolean>>;
type PanelInitiallyCollapsed = Assert<Includes<CollapsiblePanelProps["defaultCollapsed"], boolean>>;
type PanelLabel = Assert<Includes<CollapsiblePanelProps["label"], string>>;

export type TypeChecks = ButtonNativeName | ButtonNativeAria | ButtonNativeForm | ButtonVariants | IconButtonNeedsName | IconLabel | PanelLabel | PanelInitial | PanelInitiallyCollapsed;
