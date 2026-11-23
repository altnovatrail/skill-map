// The tar the scripts unpack archives with, by its fixed path in the toolchain stage's base image,
// Ubuntu's: a program looked up in PATH could come from a folder anyone may write to (SonarCloud
// typescript:S4036).
export const TAR = "/usr/bin/tar";
