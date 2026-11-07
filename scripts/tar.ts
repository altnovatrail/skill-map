// The tar the scripts unpack archives with, by its fixed path in the toolchain stage's base image,
// Ubuntu's: a program looked up in PATH could come from a folder anyone may write to (SonarCloud
// typescript:S4036; R09 in docs/decisions.md).
export const TAR = "/usr/bin/tar";
