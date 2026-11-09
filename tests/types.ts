import type { TextFieldProps } from "../dist/forms/index";
import type { ButtonProps, IconButtonProps, IconProps, ModalProps, CollapsiblePanelProps } from "../dist/index";

type Assert<T extends true> = T;
type Includes<T, U> = U extends T ? true : false;
type Excludes<T, U> = U extends T ? false : true;

type ModalReturnFocus = Assert<Includes<ModalProps["returnFocus"], HTMLElement>>;
type ButtonNativeName = Assert<Includes<ButtonProps["name"], string>>;
type ButtonNativeAria = Assert<Includes<ButtonProps["aria-describedby"], string>>;
type ButtonNativeForm = Assert<Includes<ButtonProps["form"], string>>;
type ButtonVariants = Assert<Excludes<ButtonProps["variant"], "primary">>;
type IconButtonNeedsName = Assert<Excludes<IconButtonProps, { children: null }>>;
type IconLabel = Assert<Includes<IconProps["label"], string>>;
type PanelInitial = Assert<Includes<CollapsiblePanelProps["defaultExpanded"], boolean>>;
type PanelInitiallyCollapsed = Assert<Includes<CollapsiblePanelProps["defaultCollapsed"], boolean>>;
type PanelLabel = Assert<Includes<CollapsiblePanelProps["label"], string>>;

type TextFieldNeedsId = Assert<Excludes<TextFieldProps, { label: string }>>;
type TextFieldNeedsLabel = Assert<Excludes<TextFieldProps, { id: string }>>;
type TextFieldName = Assert<Includes<TextFieldProps["name"], string>>;

export type TypeChecks = ModalReturnFocus | TextFieldNeedsId | TextFieldNeedsLabel | TextFieldName | ButtonNativeName | ButtonNativeAria | ButtonNativeForm | ButtonVariants | IconButtonNeedsName | IconLabel | PanelLabel | PanelInitial | PanelInitiallyCollapsed;
